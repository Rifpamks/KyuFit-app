const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://postgres.nvgcnagnstfvgqzjzbah:kyufit140226@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=no-verify";

async function pingDatabase() {
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
  });

  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting Supabase Keep-Alive Ping...`);

  try {
    await client.connect();
    const res = await client.query('SELECT NOW() as current_time, 1 as status;');
    console.log(`[${timestamp}] ✅ Keep-Alive SUCCESS! DB Time: ${res.rows[0].current_time}`);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error(`[${timestamp}] ❌ Keep-Alive FAILED: ${err.message}`);
    process.exit(1);
  }
}

pingDatabase();
