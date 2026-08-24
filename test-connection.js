const { Pool } = require('pg');
// Try without password
const connectionString = process.env.DATABASE_URL?.replace(/:[^:@]+@/, '@') || 'postgresql://crm_app@localhost:5432/clinica_crm';
console.log('Testing connection:', connectionString);
const pool = new Pool({ connectionString });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Success:', res.rows[0]);
  }
  pool.end();
});