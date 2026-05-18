// Execute SQL directly against Supabase via the Management API
// This bypasses the Prisma connection issues

const SUPABASE_URL = "https://bdhjcuziepopxxyljflf.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkaGpjdXppZXBvcHh4eWxqZmxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTExMzM3NywiZXhwIjoyMDk0Njg5Mzc3fQ.Q25wFVkApWk8F6EbdIWQ2cg3EJ_ddNMy06_lzR8MP0c";

const SQL = `
-- CivicDesk Schema
-- Drop existing types if they exist (for re-runs)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('citizen', 'agent', 'supervisor', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TicketStatus') THEN
    CREATE TYPE "TicketStatus" AS ENUM ('submitted', 'under_review', 'in_progress', 'pending_citizen', 'resolved', 'closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Priority') THEN
    CREATE TYPE "Priority" AS ENUM ('critical', 'high', 'medium', 'low');
  END IF;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role "UserRole" NOT NULL DEFAULT 'citizen',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  default_priority "Priority" NOT NULL DEFAULT 'medium',
  sla_hours INTEGER NOT NULL DEFAULT 72,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ticket_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status "TicketStatus" NOT NULL DEFAULT 'submitted',
  priority "Priority" NOT NULL DEFAULT 'medium',
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  due_date TIMESTAMPTZ,
  category_id TEXT NOT NULL REFERENCES categories(id),
  citizen_id TEXT NOT NULL REFERENCES users(id),
  assigned_to TEXT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  body TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timeline events table
CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  status "TicketStatus" NOT NULL,
  description TEXT NOT NULL,
  actor TEXT NOT NULL,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  action TEXT NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  actor_id TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_citizen_id ON tickets(citizen_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_category_id ON tickets(category_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_attachments_ticket_id ON attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_timeline_ticket_id ON timeline_events(ticket_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON timeline_events(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_ticket_id ON audit_log(ticket_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor_id ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
`;

async function run() {
  console.log("🔧 Creating CivicDesk database tables via Supabase API...\n");

  try {
    const response = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    });

    if (!response.ok) {
      // Try alternate endpoint
      console.log(`Main endpoint returned ${response.status}, trying SQL endpoint...`);
      
      const resp2 = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({ sql_query: SQL }),
      });

      if (!resp2.ok) {
        const text = await resp2.text();
        console.log(`SQL RPC returned ${resp2.status}: ${text}`);
        console.log("\n⚠️  Direct SQL execution not available via API.");
        console.log("📋 Please run the SQL from prisma/migration.sql in your Supabase SQL Editor.");
        console.log("   Go to: https://supabase.com/dashboard/project/bdhjcuziepopxxyljflf/sql/new");
        
        // Write the SQL to a file for easy copy
        const fs = require("fs");
        fs.writeFileSync("prisma/migration.sql", SQL);
        console.log("\n✅ SQL saved to prisma/migration.sql — copy and paste into SQL Editor.");
        return;
      }

      const result = await resp2.json();
      console.log("✅ Tables created successfully via RPC!", result);
      return;
    }

    const result = await response.json();
    console.log("✅ Tables created successfully!", result);
  } catch (err) {
    console.error("Error:", err.message);
    
    // Save SQL for manual execution
    const fs = require("fs");
    fs.writeFileSync("prisma/migration.sql", SQL);
    console.log("\n📋 SQL saved to prisma/migration.sql");
    console.log("   Paste it in: https://supabase.com/dashboard/project/bdhjcuziepopxxyljflf/sql/new");
  }
}

run();
