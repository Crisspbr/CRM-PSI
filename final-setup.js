const { Client } = require('pg');

async function main() {
  // Connect to the default database as postgres with password we know works (123456)
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '123456',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to postgres as postgres');

    // Check if clinica_crm database exists, if not create it
    const dbCheck = await client.query("SELECT 1 FROM pg_database WHERE datname = 'clinica_crm'");
    if (dbCheck.rowCount === 0) {
      await client.query('CREATE DATABASE clinica_crm');
      console.log('Created database clinica_crm');
    } else {
      console.log('Database clinica_crm already exists');
    }

    // Check if crm_app user exists, if not create it
    const userCheck = await client.query("SELECT 1 FROM pg_user WHERE usename = 'crm_app'");
    if (userCheck.rowCount === 0) {
      await client.query("CREATE USER crm_app WITH PASSWORD 'crm_app'");
      console.log('Created user crm_app');
    } else {
      // Alter the user to set password to 'crm_app'
      await client.query("ALTER USER crm_app WITH PASSWORD 'crm_app'");
      console.log('Updated password for user crm_app');
    }

    // Grant privileges on clinica_crm to crm_app
    await client.query('GRANT ALL PRIVILEGES ON DATABASE clinica_crm TO crm_app');
    console.log('Granted privileges on clinica_crm to crm_app');

    // Now test connecting to clinica_crm as crm_app
    const testClient = new Client({
      user: 'crm_app',
      host: 'localhost',
      database: 'clinica_crm',
      password: 'crm_app',
      port: 5432,
    });

    try {
      await testClient.connect();
      console.log('SUCCESS: Connected to clinica_crm as crm_app');
      // Test a simple query
      const res = await testClient.query('SELECT 1');
      console.log('Query result:', res.rows[0]);
      await testClient.end();
      // If we get here, update .env.local to use crm_app
      const fs = require('fs');
      const envContent = `DATABASE_URL=postgresql://crm_app:crm_app@localhost:5432/clinica_crm
BETTER_AUTH_SECRET=uma-chave-aleatoria-bem-longa-com-32-ou-mais-caracteres
BETTER_AUTH_URL=http://localhost:3000`;
      fs.writeFileSync('.env.local', envContent);
      console.log('Updated .env.local to use crm_app user');
    } catch (err) {
      console.error('FAILED: Could not connect to clinica_crm as crm_app:', err.message);
      // Fallback to using postgres user
      const testClient2 = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'clinica_crm',
        password: '123456',
        port: 5432,
      });
      try {
        await testClient2.connect();
        console.log('SUCCESS: Connected to clinica_crm as postgres (fallback)');
        await testClient2.end();
        // Update .env.local to use postgres
        const fs = require('fs');
        const envContent = `DATABASE_URL=postgresql://postgres:123456@localhost:5432/clinica_crm
BETTER_AUTH_SECRET=uma-chave-aleatoria-bem-longa-com-32-ou-mais-caracteres
BETTER_AUTH_URL=http://localhost:3000`;
        fs.writeFileSync('.env.local', envContent);
        console.log('Updated .env.local to use postgres user (fallback)');
      } catch (err2) {
        console.error('FAILED: Could not connect to clinica_crm as postgres either:', err2.message);
      } finally {
        await testClient2.end();
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);