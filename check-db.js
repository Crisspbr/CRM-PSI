const { Client } = require('pg');

// Using the credentials from .env.local.bak
const connectionString = 'postgresql://crm_app:postgres@localhost:5432/clinica_crm';

const client = new Client({ connectionString });

async function checkDatabase() {
  try {
    await client.connect();
    console.log('Connected to database successfully');
    
    // Check users table
    const usersResult = await client.query('SELECT id, email, name, "emailVerified" FROM "user" ORDER BY id;');
    console.log(`\n=== USERS TABLE (${usersResult.rowCount} records) ===`);
    console.table(usersResult.rows);
    
    // Check accounts table (where password hashes are stored)
    const accountsResult = await client.query('SELECT id, "userId", "providerId", password FROM account WHERE "providerId" = \'email\' ORDER BY "userId";');
    console.log(`\n=== ACCOUNTS TABLE (email providers) (${accountsResult.rowCount} records) ===`);
    console.table(accountsResult.rows);
    
    // Check if there are any users without accounts
    const orphanedUsers = await client.query(`
      SELECT u.id, u.email 
      FROM "user" u 
      LEFT JOIN account a ON u.id = a."userId" AND a."providerId" = 'email'
      WHERE a.id IS NULL;
    `);
    console.log(`\n=== USERS WITHOUT EMAIL ACCOUNT (${orphanedUsers.rowCount} records) ===`);
    if (orphanedUsers.rowCount > 0) {
      console.table(orphanedUsers.rows);
    } else {
      console.log('None');
    }
    
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await client.end();
  }
}

checkDatabase();