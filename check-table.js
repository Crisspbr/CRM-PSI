const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function checkTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check if account table exists and its columns
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'account'
      ORDER BY ordinal_position;
    `);

    if (res.rowCount === 0) {
      console.log('Table "account" does not exist');
    } else {
      console.log('Columns in "account" table:');
      console.table(res.rows);
    }

    // Also check user table for email uniqueness
    const userRes = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'user'
      ORDER BY ordinal_position;
    `);
    console.log('\nColumns in "user" table:');
    console.table(userRes.rows);

  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
  } finally {
    await client.end();
  }
}

checkTable();