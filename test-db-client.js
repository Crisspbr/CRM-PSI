const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect(err => {
  if (err) {
    console.error('Connection error:', err.stack);
  } else {
    console.log('Connected');
    client.query('SELECT NOW()', (err, res) => {
      console.log(err ? err.stack : res.rows[0]);
      client.end();
    });
  }
});