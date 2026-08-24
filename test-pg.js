const { Pool } = require('pg');
// Try postgres user with empty password
const connectionString = 'postgresql://postgres:@localhost:5432/clinica_crm';
console.log('Testing connection with postgres user (empty password):', connectionString.replace(/:[^:@]+@/, ':***@'));
const pool = new Pool({ connectionString });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Success:', res.rows[0]);
  }
  pool.end();
});