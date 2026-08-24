const { Client } = require('pg');

async function main() {
  // Connect to default database as postgres with password we know works
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
      console.log('Successfully connected to clinica_crm as crm_app');
      await testClient.end();
    } catch (err) {
      console.error('Failed to connect to clinica_crm as crm_app:', err.message);
    } finally {
      await testClient.end();
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);