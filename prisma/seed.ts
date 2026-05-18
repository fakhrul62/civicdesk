import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CivicDesk database...\n");

  // ─── CATEGORIES ─────────────────────────────
  console.log("📁 Creating categories...");

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Road & Infrastructure" },
      update: {},
      create: { name: "Road & Infrastructure", department: "Public Works", description: "Potholes, road damage, traffic signals, bridges", default_priority: "high", sla_hours: 48 },
    }),
    prisma.category.upsert({
      where: { name: "Water Supply" },
      update: {},
      create: { name: "Water Supply", department: "Water Board", description: "Water outages, contamination, pipe leaks", default_priority: "high", sla_hours: 24 },
    }),
    prisma.category.upsert({
      where: { name: "Electricity" },
      update: {},
      create: { name: "Electricity", department: "Power Division", description: "Power outages, transformer issues, illegal connections", default_priority: "high", sla_hours: 12 },
    }),
    prisma.category.upsert({
      where: { name: "Waste Management" },
      update: {},
      create: { name: "Waste Management", department: "Sanitation Dept", description: "Garbage collection, illegal dumping, recycling", default_priority: "medium", sla_hours: 72 },
    }),
    prisma.category.upsert({
      where: { name: "Public Safety" },
      update: {},
      create: { name: "Public Safety", department: "Law Enforcement", description: "Streetlights, unsafe buildings, public disturbance", default_priority: "critical", sla_hours: 6 },
    }),
    prisma.category.upsert({
      where: { name: "Parks & Recreation" },
      update: {},
      create: { name: "Parks & Recreation", department: "Urban Development", description: "Park maintenance, playground repairs, public spaces", default_priority: "low", sla_hours: 120 },
    }),
    prisma.category.upsert({
      where: { name: "Noise Complaint" },
      update: {},
      create: { name: "Noise Complaint", department: "Law Enforcement", description: "Construction noise, loud music, industrial noise", default_priority: "medium", sla_hours: 48 },
    }),
    prisma.category.upsert({
      where: { name: "Building Permits" },
      update: {},
      create: { name: "Building Permits", department: "Urban Development", description: "Illegal construction, permit violations, zoning issues", default_priority: "medium", sla_hours: 96 },
    }),
  ]);

  console.log(`  ✅ ${categories.length} categories created\n`);

  // ─── USERS ──────────────────────────────────
  console.log("👤 Creating users...");

  const passwordHash = await hash("Password123", 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "arif@example.com" },
      update: {},
      create: { email: "arif@example.com", password_hash: passwordHash, full_name: "Arif Hossain", phone: "+8801711000001", role: "citizen" },
    }),
    prisma.user.upsert({
      where: { email: "fatema@example.com" },
      update: {},
      create: { email: "fatema@example.com", password_hash: passwordHash, full_name: "Fatema Begum", phone: "+8801711000002", role: "citizen" },
    }),
    prisma.user.upsert({
      where: { email: "rashed@example.com" },
      update: {},
      create: { email: "rashed@example.com", password_hash: passwordHash, full_name: "Rashed Karim", phone: "+8801711000003", role: "citizen" },
    }),
    prisma.user.upsert({
      where: { email: "tanvir@civicdesk.gov" },
      update: {},
      create: { email: "tanvir@civicdesk.gov", password_hash: passwordHash, full_name: "Tanvir Ahmed", phone: "+8801711000004", role: "agent" },
    }),
    prisma.user.upsert({
      where: { email: "nasreen@civicdesk.gov" },
      update: {},
      create: { email: "nasreen@civicdesk.gov", password_hash: passwordHash, full_name: "Nasreen Akter", phone: "+8801711000005", role: "agent" },
    }),
    prisma.user.upsert({
      where: { email: "kamal@civicdesk.gov" },
      update: {},
      create: { email: "kamal@civicdesk.gov", password_hash: passwordHash, full_name: "Kamal Uddin", phone: "+8801711000006", role: "supervisor" },
    }),
    prisma.user.upsert({
      where: { email: "admin@civicdesk.gov" },
      update: {},
      create: { email: "admin@civicdesk.gov", password_hash: passwordHash, full_name: "Shahida Rahman", phone: "+8801711000007", role: "admin" },
    }),
  ]);

  console.log(`  ✅ ${users.length} users created`);
  console.log("  📋 Login credentials (all users): Password123\n");

  // ─── TICKETS ────────────────────────────────
  console.log("🎫 Creating tickets...");

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000);

  const tickets = await Promise.all([
    prisma.ticket.create({
      data: {
        ticket_number: "CVD-2026-0001",
        title: "Massive pothole on Mirpur Road near Dhanmondi 27",
        description: "There is a large pothole approximately 2 feet wide and 8 inches deep on the main Mirpur Road near the Dhanmondi 27 junction. Multiple vehicles have been damaged. This is a critical safety hazard, especially at night.",
        status: "in_progress",
        priority: "high",
        category_id: categories[0].id,
        citizen_id: users[0].id,
        assigned_to: users[3].id,
        location: "Mirpur Road, Dhanmondi 27, Dhaka",
        due_date: daysAgo(-2),
        created_at: daysAgo(5),
        updated_at: hoursAgo(3),
      },
    }),
    prisma.ticket.create({
      data: {
        ticket_number: "CVD-2026-0002",
        title: "No water supply in Uttara Sector 7 for 3 days",
        description: "Residents of Uttara Sector 7, Block C have been without water supply for the past 3 days. No advance notice was given. Elderly residents and families with young children are severely affected.",
        status: "under_review",
        priority: "critical",
        category_id: categories[1].id,
        citizen_id: users[1].id,
        assigned_to: users[4].id,
        location: "Sector 7, Block C, Uttara, Dhaka",
        due_date: daysAgo(-1),
        created_at: daysAgo(3),
        updated_at: daysAgo(1),
      },
    }),
    prisma.ticket.create({
      data: {
        ticket_number: "CVD-2026-0003",
        title: "Frequent power outages in Mohammadpur industrial area",
        description: "The Mohammadpur industrial area has been experiencing 4-5 power outages daily, each lasting 1-2 hours. Multiple small businesses are being severely impacted. Transformers appear overloaded.",
        status: "submitted",
        priority: "high",
        category_id: categories[2].id,
        citizen_id: users[2].id,
        location: "Mohammadpur Industrial Area, Dhaka",
        due_date: daysAgo(-3),
        created_at: daysAgo(2),
        updated_at: daysAgo(2),
      },
    }),
    prisma.ticket.create({
      data: {
        ticket_number: "CVD-2026-0004",
        title: "Garbage piling up at Gulshan 2 circle for a week",
        description: "Garbage has not been collected from the Gulshan 2 circle area for over a week. The pile is attracting stray animals and creating health hazards. The stench is unbearable for nearby residents and shopkeepers.",
        status: "pending_citizen",
        priority: "medium",
        category_id: categories[3].id,
        citizen_id: users[0].id,
        assigned_to: users[3].id,
        location: "Gulshan 2 Circle, Dhaka",
        due_date: daysAgo(1),
        created_at: daysAgo(8),
        updated_at: daysAgo(2),
      },
    }),
    prisma.ticket.create({
      data: {
        ticket_number: "CVD-2026-0005",
        title: "Broken streetlights on entire stretch of Airport Road",
        description: "At least 15 streetlights on the Airport Road stretch between Khilkhet and Kuril are non-functional. This creates extremely dangerous conditions for pedestrians and drivers at night.",
        status: "resolved",
        priority: "medium",
        category_id: categories[4].id,
        citizen_id: users[1].id,
        assigned_to: users[4].id,
        location: "Airport Road, Khilkhet to Kuril, Dhaka",
        due_date: daysAgo(5),
        created_at: daysAgo(15),
        updated_at: daysAgo(3),
        resolved_at: daysAgo(3),
      },
    }),
    prisma.ticket.create({
      data: {
        ticket_number: "CVD-2026-0006",
        title: "Vandalized playground equipment in Ramna Park",
        description: "The playground area in Ramna Park has been vandalized. Multiple swings are broken, the slide has sharp edges exposed, and the see-saw is missing bolts. Children are at risk of injury.",
        status: "in_progress",
        priority: "low",
        category_id: categories[5].id,
        citizen_id: users[2].id,
        assigned_to: users[3].id,
        location: "Ramna Park, Dhaka",
        due_date: daysAgo(-5),
        created_at: daysAgo(10),
        updated_at: daysAgo(1),
      },
    }),
    prisma.ticket.create({
      data: {
        ticket_number: "CVD-2026-0007",
        title: "Illegal construction noise at midnight in Banani",
        description: "A construction project at Road 11, Banani has been operating heavy machinery between 11 PM and 4 AM for the past week. Multiple residents have filed verbal complaints with no action taken.",
        status: "submitted",
        priority: "medium",
        category_id: categories[6].id,
        citizen_id: users[0].id,
        location: "Road 11, Banani, Dhaka",
        due_date: daysAgo(-2),
        created_at: daysAgo(1),
        updated_at: daysAgo(1),
      },
    }),
    prisma.ticket.create({
      data: {
        ticket_number: "CVD-2026-0008",
        title: "Unauthorized multi-story building exceeding permit",
        description: "A building under construction on Road 5, Dhanmondi appears to be exceeding its 6-story permit by at least 3 additional floors. This is a clear violation of building codes and poses structural risk to neighboring buildings.",
        status: "closed",
        priority: "high",
        category_id: categories[7].id,
        citizen_id: users[1].id,
        assigned_to: users[4].id,
        location: "Road 5, Dhanmondi, Dhaka",
        due_date: daysAgo(10),
        created_at: daysAgo(20),
        updated_at: daysAgo(5),
        resolved_at: daysAgo(7),
      },
    }),
  ]);

  console.log(`  ✅ ${tickets.length} tickets created\n`);

  // ─── MESSAGES ───────────────────────────────
  console.log("💬 Creating messages...");

  await prisma.message.createMany({
    data: [
      { ticket_id: tickets[0].id, sender_id: users[0].id, body: "This pothole has been here for over 2 weeks now. My car's suspension was damaged yesterday. Please fix this urgently.", is_internal: false, created_at: daysAgo(5) },
      { ticket_id: tickets[0].id, sender_id: users[3].id, body: "Thank you for reporting this issue. We have dispatched an inspection team to the location. Expected inspection by tomorrow morning.", is_internal: false, created_at: daysAgo(4) },
      { ticket_id: tickets[0].id, sender_id: users[3].id, body: "Internal: Road maintenance team confirms this requires full patching, not just filling. Escalating to supervisor for budget approval.", is_internal: true, created_at: daysAgo(3) },
      { ticket_id: tickets[0].id, sender_id: users[0].id, body: "Any update on the repair timeline? The pothole seems to have gotten worse after last night's rain.", is_internal: false, created_at: daysAgo(2) },
      { ticket_id: tickets[0].id, sender_id: users[3].id, body: "Budget approved. Repair work is scheduled for this Saturday. The road section will be temporarily closed from 6 AM to 2 PM.", is_internal: false, created_at: hoursAgo(3) },
      { ticket_id: tickets[1].id, sender_id: users[1].id, body: "We urgently need water supply restored. My elderly mother needs water for her medication. This has been going on for 3 days!", is_internal: false, created_at: daysAgo(3) },
      { ticket_id: tickets[1].id, sender_id: users[4].id, body: "We understand the urgency. A burst main pipe was identified at Sector 7 junction. Repair team has been dispatched.", is_internal: false, created_at: daysAgo(2) },
    ],
  });

  console.log("  ✅ Messages created\n");

  // ─── TIMELINE ───────────────────────────────
  console.log("📅 Creating timeline events...");

  await prisma.timelineEvent.createMany({
    data: [
      { ticket_id: tickets[0].id, status: "submitted", description: "Complaint submitted", actor: "Arif Hossain", created_at: daysAgo(5) },
      { ticket_id: tickets[0].id, status: "under_review", description: "Assigned to agent for review", actor: "System", created_at: daysAgo(4) },
      { ticket_id: tickets[0].id, status: "in_progress", description: "Inspection completed, repair scheduled", actor: "Tanvir Ahmed", created_at: daysAgo(3) },
      { ticket_id: tickets[1].id, status: "submitted", description: "Complaint submitted", actor: "Fatema Begum", created_at: daysAgo(3) },
      { ticket_id: tickets[1].id, status: "under_review", description: "Under review by Water Board", actor: "Nasreen Akter", created_at: daysAgo(2) },
      { ticket_id: tickets[4].id, status: "submitted", description: "Complaint submitted", actor: "Fatema Begum", created_at: daysAgo(15) },
      { ticket_id: tickets[4].id, status: "in_progress", description: "Repair crew dispatched", actor: "Nasreen Akter", created_at: daysAgo(10) },
      { ticket_id: tickets[4].id, status: "resolved", description: "All streetlights repaired and tested", actor: "Nasreen Akter", created_at: daysAgo(3) },
    ],
  });

  console.log("  ✅ Timeline events created\n");

  // ─── AUDIT LOG ──────────────────────────────
  console.log("📋 Creating audit log entries...");

  await prisma.auditLog.createMany({
    data: [
      { ticket_id: tickets[0].id, actor_id: users[0].id, action: "Ticket created", field: "status", new_value: "Submitted", created_at: daysAgo(5) },
      { ticket_id: tickets[0].id, actor_id: users[6].id, action: "Assigned agent", field: "assigned_to", new_value: "Tanvir Ahmed", created_at: daysAgo(4) },
      { ticket_id: tickets[0].id, actor_id: users[3].id, action: "Status changed", field: "status", old_value: "Submitted", new_value: "Under Review", created_at: daysAgo(4) },
      { ticket_id: tickets[0].id, actor_id: users[3].id, action: "Status changed", field: "status", old_value: "Under Review", new_value: "In Progress", created_at: daysAgo(3) },
      { ticket_id: tickets[1].id, actor_id: users[1].id, action: "Ticket created", field: "status", new_value: "Submitted", created_at: daysAgo(3) },
      { ticket_id: tickets[1].id, actor_id: users[6].id, action: "Assigned agent", field: "assigned_to", new_value: "Nasreen Akter", created_at: daysAgo(2) },
      { ticket_id: tickets[1].id, actor_id: users[4].id, action: "Status changed", field: "status", old_value: "Submitted", new_value: "Under Review", created_at: daysAgo(2) },
      { ticket_id: tickets[1].id, actor_id: users[6].id, action: "Priority changed", field: "priority", old_value: "High", new_value: "Critical", created_at: daysAgo(1) },
      { ticket_id: tickets[2].id, actor_id: users[2].id, action: "Ticket created", field: "status", new_value: "Submitted", created_at: daysAgo(2) },
      { ticket_id: tickets[3].id, actor_id: users[0].id, action: "Ticket created", field: "status", new_value: "Submitted", created_at: daysAgo(8) },
      { ticket_id: tickets[4].id, actor_id: users[1].id, action: "Ticket created", field: "status", new_value: "Submitted", created_at: daysAgo(15) },
      { ticket_id: tickets[4].id, actor_id: users[4].id, action: "Status changed", field: "status", old_value: "In Progress", new_value: "Resolved", created_at: daysAgo(3) },
    ],
  });

  console.log("  ✅ Audit log entries created\n");

  // ─── NOTIFICATIONS ──────────────────────────
  console.log("🔔 Creating notifications...");

  await prisma.notification.createMany({
    data: [
      { user_id: users[6].id, title: "New complaint submitted", body: "CVD-2026-0003 — Frequent power outages in Mohammadpur", link: `/admin/tickets/${tickets[2].id}`, created_at: daysAgo(2) },
      { user_id: users[6].id, title: "New complaint submitted", body: "CVD-2026-0007 — Illegal construction noise at midnight", link: `/admin/tickets/${tickets[6].id}`, created_at: daysAgo(1) },
      { user_id: users[6].id, title: "SLA breach warning", body: "CVD-2026-0004 is approaching its SLA deadline", link: `/admin/tickets/${tickets[3].id}`, created_at: hoursAgo(6) },
    ],
  });

  console.log("  ✅ Notifications created\n");

  console.log("─────────────────────────────────────");
  console.log("✅ Database seeded successfully!");
  console.log("─────────────────────────────────────\n");
  console.log("📋 Test Accounts:");
  console.log("  Citizen:    arif@example.com / Password123");
  console.log("  Agent:      tanvir@civicdesk.gov / Password123");
  console.log("  Supervisor: kamal@civicdesk.gov / Password123");
  console.log("  Admin:      admin@civicdesk.gov / Password123");
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
