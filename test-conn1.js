const { Client } = require('pg');

// Try common password for crm_app user
const connectionString = 'postgresql://crm_app:postgres@localhost:5432/clinica_crm';

const client = new Client({ connectionString });

async function testConnection() {
  try {
    await client.connect();
    console.log('✓ Connected successfully with crm_app/postgres');
    
    // Check if we can query
    const res = await client.query('SELECT version();');
    console.log('PostgreSQL version:', res.rows[0].version);
    
    await client.end();
    return true;
  } catch (err) {
    console.error('✗ Failed to connect with crm_app/postgres:', err.message);
    return false;
  }
}

testConnection();