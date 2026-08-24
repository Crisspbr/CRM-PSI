require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function checkUsers() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    const res = await client.query('SELECT id, email, name, "emailVerified" FROM "user" ORDER BY id;');
    console.log('Users found:', res.rowCount);
    console.table(res.rows);
    
    // Also check accounts table for password info
    const accountsRes = await client.query('SELECT userId, providerId, password FROM account WHERE providerId = \'email\' ORDER BY userId;');
    console.log('\\nEmail accounts:', accountsRes.rowCount);
    console.table(accountsRes.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkUsers();