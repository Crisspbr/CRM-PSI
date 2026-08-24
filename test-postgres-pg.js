const { Pool } = require('pg');

const connectionString = 'postgresql://postgres:123456@localhost:5432/clinica_crm';
console.log('Testing connection:', connectionString.replace(/:[^:@]+@/, ':***@'));
const pool = new Pool({ connectionString });
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Success:', res.rows[0]);
  }
  pool.end();
});