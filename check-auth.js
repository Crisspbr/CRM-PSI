require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

console.log('DATABASE_URL from env:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function checkAuthTables() {
  try {
    await client.connect();
    console.log('✓ Connected to database successfully');
    
    // Check users table
    const usersResult = await client.query('SELECT id, email, name, "emailVerified" FROM "user" ORDER BY id;');
    console.log(`\n=== USERS TABLE (${usersResult.rowCount} records) ===`);
    if (usersResult.rowCount > 0) {
      console.table(usersResult.rows);
    } else {
      console.log('(empty)');
    }
    
    // Check accounts table
    const accountsResult = await client.query(`
      SELECT 
        id, 
        "userId", 
        "providerId", 
        password IS NOT NULL as hasPassword,
        "createdAt"
      FROM account 
      WHERE "providerId" = 'email'
      ORDER BY "createdAt" DESC;
    `);
    console.log(`\n=== EMAIL ACCOUNTS TABLE (${accountsResult.rowCount} records) ===`);
    if (accountsResult.rowCount > 0) {
      console.table(accountsResult.rows);
    } else {
      console.log('(empty)');
    }
    
    // Check for users without accounts
    const orphanedResult = await client.query(`
      SELECT u.id, u.email, u.name
      FROM "user" u
      LEFT JOIN account a ON u.id = a."userId" AND a."providerId" = 'email'
      WHERE a.id IS NULL;
    `);
    console.log(`\n=== USERS WITHOUT EMAIL ACCOUNT (${orphanedResult.rowCount} records) ===`);
    if (orphanedResult.rowCount > 0) {
      console.table(orphanedResult.rows);
    } else {
      console.log('(none)');
    }
    
  } catch (err) {
    console.error('✗ Database error:', err.message);
  } finally {
    await client.end();
  }
}

checkAuthTables();