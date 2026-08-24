const { Pool } = require('pg');

async function testConnection(connectionString, description) {
  console.log(`Testing ${description}:`, connectionString.replace(/:[^:@]+@/, ':***@'));
  const pool = new Pool({ connectionString });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(`  Success:`, res.rows[0]);
    await pool.end();
    return true;
  } catch (err) {
    console.error(`  Error:`, err.message);
    await pool.end();
    return false;
  }
}

async function main() {
  // List of connection strings to try
  const connectionStrings = [
    { string: 'postgresql://postgres:postgres@localhost:5432/clinica_crm', desc: 'postgres/postgres' },
    { string: 'postgresql://postgres:@localhost:5432/clinica_crm', desc: 'postgres/empty password' },
    { string: 'postgresql://postgres@localhost:5432/clinica_crm', desc: 'postgres/no password' },
    { string: 'postgresql://crm_app:crm_app@localhost:5432/clinica_crm', desc: 'crm_app/crm_app' },
    { string: 'postgresql://crm_app:@localhost:5432/clinica_crm', desc: 'crm_app/empty password' },
    { string: 'postgresql://crm_app@localhost:5432/clinica_crm', desc: 'crm_app/no password' },
  ];

  let success = false;
  for (const {string, desc} of connectionStrings) {
    if (await testConnection(string, desc)) {
      success = true;
      break; // stop at first success
    }
  }

  if (!success) {
    console.log('\\nAll connection attempts failed.');
    // Try to connect to default database to see if we can at least connect to postgres
    const adminString = 'postgresql://postgres:postgres@localhost:5432/postgres';
    console.log(`\\nTrying to connect to default database as postgres/postgres:`);
    await testConnection(adminString, 'postgres/postgres to default db');
  }
}

main().catch(console.error);