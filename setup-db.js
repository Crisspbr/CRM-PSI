const { Client } = require('pg');

const passwordsToTry = ['', 'postgres', 'password', 'admin', 'root', '123456'];
const usersToTry = ['crm_app', 'postgres'];

async function tryConnection(user, password, database) {
  const connectionString = `postgresql://${user}:${password}@localhost:5432/${database}`;
  console.log(`Trying: ${user}/${password || '(empty)'} on ${database}`);
  const client = new Client({ connectionString });
  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return { success: true, connectionString };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function main() {
  for (const user of usersToTry) {
    for (const password of passwordsToTry) {
      // First try to connect to the default database (postgres) to have privileges
      const result = await tryConnection(user, password, 'postgres');
      if (result.success) {
        console.log(`Success connected as ${user} with password '${password}' to postgres`);
        // Now we can try to create the database and user if needed
        const client = new Client({ connectionString: result.connectionString });
        try {
          await client.connect();
          // Check if database clinica_crm exists
          const dbRes = await client.query("SELECT 1 FROM pg_database WHERE datname = 'clinica_crm'");
          if (dbRes.rowCount === 0) {
            await client.query('CREATE DATABASE clinica_crm');
            console.log('Created database clinica_crm');
          }
          // Check if user crm_app exists
          const userRes = await client.query("SELECT 1 FROM pg_user WHERE usename = 'crm_app'");
          if (userRes.rowCount === 0) {
            await client.query("CREATE USER crm_app WITH PASSWORD 'crm_app'");
            console.log('Created user crm_app');
          }
          // Grant privileges
          await client.query('GRANT ALL PRIVILEGES ON DATABASE clinica_crm TO crm_app');
          console.log('Granted privileges on clinica_crm to crm_app');
          await client.end();
          // Now try to connect to the clinica_crm database as crm_app with the password we set
          const testResult = await tryConnection('crm_app', 'crm_app', 'clinica_crm');
          if (testResult.success) {
            console.log(`Success: Can connect to clinica_crm as crm_app with password 'crm_app'`);
            console.log(`Update your .env.local to:`);
            console.log(`DATABASE_URL=postgresql://crm_app:crm_app@localhost:5432/clinica_crm`);
            return;
          } else {
            console.log(`Failed to connect to clinica_crm as crm_app: ${testResult.error}`);
          }
        } catch (err) {
          console.log(`Error during setup: ${err.message}`);
        } finally {
          await client.end();
        }
        return;
      }
    }
  }
  console.log('Could not connect as any of the tried users with the tried passwords.');
}

main().catch(console.error);