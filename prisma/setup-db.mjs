import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

async function run() {
  console.log("🔧 Connecting to Supabase database...\n");

  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  });

  try {
    await client.connect();
    console.log("✅ Connected successfully!\n");

    // Read and execute migration SQL
    const migrationSql = fs.readFileSync(path.join(__dirname, 'migration.sql'), 'utf-8');
    console.log("📦 Creating tables...");
    await client.query(migrationSql);
    console.log("✅ Tables created successfully!\n");

    // Read and execute seed SQL
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    console.log("🌱 Seeding data...");
    await client.query(seedSql);
    console.log("✅ Data seeded successfully!\n");

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    console.log("📋 Tables in database:");
    result.rows.forEach(row => console.log(`   ✓ ${row.table_name}`));

    // Count records
    const counts = await client.query(`
      SELECT 'users' as tbl, count(*) as cnt FROM users
      UNION ALL SELECT 'categories', count(*) FROM categories
      UNION ALL SELECT 'tickets', count(*) FROM tickets
      UNION ALL SELECT 'messages', count(*) FROM messages
      UNION ALL SELECT 'timeline_events', count(*) FROM timeline_events
      UNION ALL SELECT 'audit_log', count(*) FROM audit_log
      UNION ALL SELECT 'notifications', count(*) FROM notifications;
    `);
    console.log("\n📊 Record counts:");
    counts.rows.forEach(row => console.log(`   ${row.tbl}: ${row.cnt} rows`));

    console.log("\n─────────────────────────────────────");
    console.log("✅ Database setup complete!");
    console.log("─────────────────────────────────────\n");

  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.message.includes("already exists")) {
      console.log("   (Tables may already exist — this is OK)");
    }
  } finally {
    await client.end();
  }
}

run();
