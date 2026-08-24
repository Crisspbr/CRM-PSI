const { Client } = require('pg');

// Using credentials inferred from .env.local.bak
const connectionString = 'postgresql://crm_app:postgres@localhost:5432/clinica_crm';

const client = new Client({ connectionString });

async function inspectAuthTables() {
  try {
    await client.connect();
    console.log('✓ Connected to database');
    
    // Check users table structure and data
    const usersResult = await client.query(`
      SELECT 
        id, 
        email, 
        name, 
        "emailVerified",
        "createdAt",
        "updatedAt"
      FROM "user" 
      ORDER BY "createdAt" DESC;
    `);
    console.log(`\n=== USERS TABLE (${usersResult.rowCount} records) ===`);
    if (usersResult.rowCount > 0) {
      console.table(usersResult.rows);
    } else {
      console.log('(empty)');
    }
    
    // Check accounts table (where credentials are stored)
    const accountsResult = await client.query(`
      SELECT 
        a.id,
        a."userId",
        a."providerId",
        a."accessToken" IS NOT NULL as hasAccessToken,
        a."refreshToken" IS NOT NULL as hasRefreshToken,
        a.password IS NOT NULL as hasPassword,
        a."createdAt"
      FROM account a
      WHERE a."providerId" = 'email'
      ORDER BY a."createdAt" DESC;
    `);
    console.log(`\n=== EMAIL ACCOUNTS TABLE (${accountsResult.rowCount} records) ===`);
    if (accountsResult.rowCount > 0) {
      console.table(accountsResult.rows);
    } else {
      console.log('(empty)');
    }
    
    // Find users without email accounts (orphaned users)
    const orphanedResult = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u."createdAt"
      FROM "user" u
      LEFT JOIN account a ON u.id = a."userId" AND a."providerId" = 'email'
      WHERE a.id IS NULL
      ORDER BY u."createdAt" DESC;
    `);
    console.log(`\n=== ORPHANED USERS (no email account) (${orphanedResult.rowCount} records) ===`);
    if (orphanedResult.rowCount > 0) {
      console.table(orphanedResult.rows);
    } else {
      console.log('(none - good!)');
    }
    
    // Find accounts without users (shouldn't happen with FK constraints)
    const abandonedResult = await client.query(`
      SELECT 
        a.id,
        a."userId",
        a."providerId",
        a."createdAt"
      FROM account a
      LEFT JOIN "user" u ON a."userId" = u.id
      WHERE a."providerId" = 'email' AND u.id IS NULL
      ORDER BY a."createdAt" DESC;
    `);
    console.log(`\n=== ABANDONED ACCOUNTS (no user) (${abandonedResult.rowCount} records) ===`);
    if (abandonedResult.rowCount > 0) {
      console.table(abandonedResult.rows);
    } else {
      console.log('(none - good!)');
    }
    
    // Show any verification records
    const verificationResult = await client.query(`
      SELECT 
        v.id,
        v.identifier,
        v.value,
        v."expiresAt",
        v."createdAt"
      FROM verification v
      ORDER BY v."createdAt" DESC
      LIMIT 10;
    `);
    console.log(`\n=== RECENT VERIFICATION RECORDS (${verificationResult.rowCount} records) ===`);
    if (verificationResult.rowCount > 0) {
      console.table(verificationResult.rows);
    } else {
      console.log('(empty)');
    }
    
  } catch (err) {
    console.error('✗ Database error:', err.message);
    console.error('Make sure:');
    console.error('1. PostgreSQL is running on localhost:5432');
    console.error('2. Database "clinica_crm" exists');
    console.error('3. User "crm_app" has password "postgres"');
    console.error('4. User has permission to connect');
  } finally {
    await client.end();
  }
}

inspectAuthTables();