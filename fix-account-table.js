const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function fixAccountTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Add missing columns to account table
    const alterStatements = [
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "tokenId" TEXT',
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessTokenTokenType" TEXT',
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshTokenTokenType" TEXT',
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "idTokenTokenType" TEXT',
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "federationId" TEXT',
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "federationUser" TEXT',
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT',
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "salt" TEXT',
      'ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "issuer" TEXT'
    ];

    for (const statement of alterStatements) {
      try {
        await client.query(statement);
        console.log(`Executed: ${statement}`);
      } catch (error) {
        console.error(`Error executing ${statement}:`, error.message);
      }
    }

    console.log('Account table fix completed');
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.end();
  }
}

fixAccountTable();