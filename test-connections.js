const { Pool } = require('pg');

const testConnection = (connectionString, description) => {
  console.log(`Testing ${description}:`, connectionString.replace(/:[^:@]+@/, ':***@'));
  const pool = new Pool({ connectionString });
  pool.query('SELECT NOW()', (err, res) => {
    pool.end();
    if (err) {
      console.error(`  Error:`, err.message);
    } else {
      console.log(`  Success:`, res.rows[0]);
      return true;
    }
    return false;
  });
};

// List of connection strings to try
const connectionStrings = [
  { string: 'postgresql://postgres:postgres@localhost:5432/clinica_crm', desc: 'postgres/postgres' },
  { string: 'postgresql://postgres:@localhost:5432/clinica_crm', desc: 'postgres/empty password' },
  { string: 'postgresql://postgres@localhost:5432/clinica_crm', desc: 'postgres/no password' },
  { string: 'postgresql://crm_app:crm_app@localhost:5432/clinica_crm', desc: 'crm_app/crm_app' },
  { string: 'postgresql://crm_app:@localhost:5432/clinica_crm', desc: 'crm_app/empty password' },
  { string: 'postgresql://crm_app@localhost:5432/clinica_crm', desc: 'crm_app/no password' },
];

connectionStrings.forEach(({string, desc}) => {
  testConnection(string, desc);
});

// Also try to create database and user if needed
const adminString = 'postgresql://postgres:postgres@localhost:5432/postgres'; // connect to default db
console.log(`\\nTrying to connect to default database as postgres/postgres:`);
const adminPool = new Pool({ connectionString: adminString });
adminPool.query('SELECT 1', (err, res) => {
  adminPool.end();
  if (err) {
    console.error('Failed to connect to default database:', err.message);
  } else {
    console.log('Connected to default database');
    // Now we can check if clinica_crm exists and create if not
    // But we'll do that in a separate step
  }
});