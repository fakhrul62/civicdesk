-- CivicDesk Seed Data
-- Run this AFTER migration.sql in Supabase SQL Editor

-- Categories
INSERT INTO categories (id, name, department, description, default_priority, sla_hours) VALUES
  ('cat1', 'Road & Infrastructure', 'Public Works', 'Potholes, road damage, traffic signals, bridges', 'high', 48),
  ('cat2', 'Water Supply', 'Water Board', 'Water outages, contamination, pipe leaks', 'high', 24),
  ('cat3', 'Electricity', 'Power Division', 'Power outages, transformer issues, illegal connections', 'high', 12),
  ('cat4', 'Waste Management', 'Sanitation Dept', 'Garbage collection, illegal dumping, recycling', 'medium', 72),
  ('cat5', 'Public Safety', 'Law Enforcement', 'Streetlights, unsafe buildings, public disturbance', 'critical', 6),
  ('cat6', 'Parks & Recreation', 'Urban Development', 'Park maintenance, playground repairs, public spaces', 'low', 120),
  ('cat7', 'Noise Complaint', 'Law Enforcement', 'Construction noise, loud music, industrial noise', 'medium', 48),
  ('cat8', 'Building Permits', 'Urban Development', 'Illegal construction, permit violations, zoning issues', 'medium', 96)
ON CONFLICT (name) DO NOTHING;

-- Users (password: Password123 hashed with bcrypt)
INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES
  ('u1', 'arif@example.com', '$2b$12$LJ3mF.S3Hb2h0QdKzHvJxuNaQVVQi5/YGq3Md3mxDQJHMGzH1YZe', 'Arif Hossain', '+8801711000001', 'citizen'),
  ('u2', 'fatema@example.com', '$2b$12$LJ3mF.S3Hb2h0QdKzHvJxuNaQVVQi5/YGq3Md3mxDQJHMGzH1YZe', 'Fatema Begum', '+8801711000002', 'citizen'),
  ('u3', 'rashed@example.com', '$2b$12$LJ3mF.S3Hb2h0QdKzHvJxuNaQVVQi5/YGq3Md3mxDQJHMGzH1YZe', 'Rashed Karim', '+8801711000003', 'citizen'),
  ('u4', 'tanvir@civicdesk.gov', '$2b$12$LJ3mF.S3Hb2h0QdKzHvJxuNaQVVQi5/YGq3Md3mxDQJHMGzH1YZe', 'Tanvir Ahmed', '+8801711000004', 'agent'),
  ('u5', 'nasreen@civicdesk.gov', '$2b$12$LJ3mF.S3Hb2h0QdKzHvJxuNaQVVQi5/YGq3Md3mxDQJHMGzH1YZe', 'Nasreen Akter', '+8801711000005', 'agent'),
  ('u6', 'kamal@civicdesk.gov', '$2b$12$LJ3mF.S3Hb2h0QdKzHvJxuNaQVVQi5/YGq3Md3mxDQJHMGzH1YZe', 'Kamal Uddin', '+8801711000006', 'supervisor'),
  ('u7', 'admin@civicdesk.gov', '$2b$12$LJ3mF.S3Hb2h0QdKzHvJxuNaQVVQi5/YGq3Md3mxDQJHMGzH1YZe', 'Shahida Rahman', '+8801711000007', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Tickets
INSERT INTO tickets (id, ticket_number, title, description, status, priority, category_id, citizen_id, assigned_to, location, due_date, created_at, updated_at, resolved_at) VALUES
  ('t1', 'CVD-2026-0001', 'Massive pothole on Mirpur Road near Dhanmondi 27', 'There is a large pothole approximately 2 feet wide and 8 inches deep on the main Mirpur Road near the Dhanmondi 27 junction. Multiple vehicles have been damaged.', 'in_progress', 'high', 'cat1', 'u1', 'u4', 'Mirpur Road, Dhanmondi 27, Dhaka', now() + interval '2 days', now() - interval '5 days', now() - interval '3 hours', NULL),
  ('t2', 'CVD-2026-0002', 'No water supply in Uttara Sector 7 for 3 days', 'Residents of Uttara Sector 7, Block C have been without water supply for the past 3 days. No advance notice was given.', 'under_review', 'critical', 'cat2', 'u2', 'u5', 'Sector 7, Block C, Uttara, Dhaka', now() + interval '1 day', now() - interval '3 days', now() - interval '1 day', NULL),
  ('t3', 'CVD-2026-0003', 'Frequent power outages in Mohammadpur industrial area', 'The Mohammadpur industrial area has been experiencing 4-5 power outages daily, each lasting 1-2 hours.', 'submitted', 'high', 'cat3', 'u3', NULL, 'Mohammadpur Industrial Area, Dhaka', now() + interval '3 days', now() - interval '2 days', now() - interval '2 days', NULL),
  ('t4', 'CVD-2026-0004', 'Garbage piling up at Gulshan 2 circle for a week', 'Garbage has not been collected from the Gulshan 2 circle area for over a week. The stench is unbearable.', 'pending_citizen', 'medium', 'cat4', 'u1', 'u4', 'Gulshan 2 Circle, Dhaka', now() - interval '1 day', now() - interval '8 days', now() - interval '2 days', NULL),
  ('t5', 'CVD-2026-0005', 'Broken streetlights on entire stretch of Airport Road', 'At least 15 streetlights on the Airport Road stretch between Khilkhet and Kuril are non-functional.', 'resolved', 'medium', 'cat5', 'u2', 'u5', 'Airport Road, Khilkhet to Kuril, Dhaka', now() - interval '5 days', now() - interval '15 days', now() - interval '3 days', now() - interval '3 days'),
  ('t6', 'CVD-2026-0006', 'Vandalized playground equipment in Ramna Park', 'The playground area in Ramna Park has been vandalized. Multiple swings are broken.', 'in_progress', 'low', 'cat6', 'u3', 'u4', 'Ramna Park, Dhaka', now() + interval '5 days', now() - interval '10 days', now() - interval '1 day', NULL),
  ('t7', 'CVD-2026-0007', 'Illegal construction noise at midnight in Banani', 'A construction project at Road 11, Banani has been operating heavy machinery between 11 PM and 4 AM.', 'submitted', 'medium', 'cat7', 'u1', NULL, 'Road 11, Banani, Dhaka', now() + interval '2 days', now() - interval '1 day', now() - interval '1 day', NULL),
  ('t8', 'CVD-2026-0008', 'Unauthorized multi-story building exceeding permit', 'A building under construction on Road 5, Dhanmondi appears to be exceeding its 6-story permit by 3 floors.', 'closed', 'high', 'cat8', 'u2', 'u5', 'Road 5, Dhanmondi, Dhaka', now() - interval '10 days', now() - interval '20 days', now() - interval '5 days', now() - interval '7 days')
ON CONFLICT (ticket_number) DO NOTHING;

-- Messages
INSERT INTO messages (ticket_id, sender_id, body, is_internal, created_at) VALUES
  ('t1', 'u1', 'This pothole has been here for over 2 weeks now. My car''s suspension was damaged yesterday. Please fix this urgently.', false, now() - interval '5 days'),
  ('t1', 'u4', 'Thank you for reporting this issue. We have dispatched an inspection team to the location. Expected inspection by tomorrow morning.', false, now() - interval '4 days'),
  ('t1', 'u4', 'Internal: Road maintenance team confirms this requires full patching, not just filling. Escalating to supervisor for budget approval.', true, now() - interval '3 days'),
  ('t1', 'u1', 'Any update on the repair timeline? The pothole seems to have gotten worse after last night''s rain.', false, now() - interval '2 days'),
  ('t1', 'u4', 'Budget approved. Repair work is scheduled for this Saturday. The road section will be temporarily closed from 6 AM to 2 PM.', false, now() - interval '3 hours'),
  ('t2', 'u2', 'We urgently need water supply restored. My elderly mother needs water for her medication.', false, now() - interval '3 days'),
  ('t2', 'u5', 'We understand the urgency. A burst main pipe was identified at Sector 7 junction. Repair team has been dispatched.', false, now() - interval '2 days');

-- Timeline Events
INSERT INTO timeline_events (ticket_id, status, description, actor, created_at) VALUES
  ('t1', 'submitted', 'Complaint submitted', 'Arif Hossain', now() - interval '5 days'),
  ('t1', 'under_review', 'Assigned to agent for review', 'System', now() - interval '4 days'),
  ('t1', 'in_progress', 'Inspection completed, repair scheduled', 'Tanvir Ahmed', now() - interval '3 days'),
  ('t2', 'submitted', 'Complaint submitted', 'Fatema Begum', now() - interval '3 days'),
  ('t2', 'under_review', 'Under review by Water Board', 'Nasreen Akter', now() - interval '2 days'),
  ('t5', 'submitted', 'Complaint submitted', 'Fatema Begum', now() - interval '15 days'),
  ('t5', 'in_progress', 'Repair crew dispatched', 'Nasreen Akter', now() - interval '10 days'),
  ('t5', 'resolved', 'All streetlights repaired and tested', 'Nasreen Akter', now() - interval '3 days');

-- Audit Log
INSERT INTO audit_log (ticket_id, actor_id, action, field, old_value, new_value, created_at) VALUES
  ('t1', 'u1', 'Ticket created', 'status', NULL, 'Submitted', now() - interval '5 days'),
  ('t1', 'u7', 'Assigned agent', 'assigned_to', NULL, 'Tanvir Ahmed', now() - interval '4 days'),
  ('t1', 'u4', 'Status changed', 'status', 'Submitted', 'Under Review', now() - interval '4 days'),
  ('t1', 'u4', 'Status changed', 'status', 'Under Review', 'In Progress', now() - interval '3 days'),
  ('t2', 'u2', 'Ticket created', 'status', NULL, 'Submitted', now() - interval '3 days'),
  ('t2', 'u7', 'Assigned agent', 'assigned_to', NULL, 'Nasreen Akter', now() - interval '2 days'),
  ('t2', 'u5', 'Status changed', 'status', 'Submitted', 'Under Review', now() - interval '2 days'),
  ('t2', 'u7', 'Priority changed', 'priority', 'High', 'Critical', now() - interval '1 day'),
  ('t3', 'u3', 'Ticket created', 'status', NULL, 'Submitted', now() - interval '2 days'),
  ('t4', 'u1', 'Ticket created', 'status', NULL, 'Submitted', now() - interval '8 days'),
  ('t5', 'u2', 'Ticket created', 'status', NULL, 'Submitted', now() - interval '15 days'),
  ('t5', 'u5', 'Status changed', 'status', 'In Progress', 'Resolved', now() - interval '3 days');

-- Notifications
INSERT INTO notifications (user_id, title, body, link, created_at) VALUES
  ('u7', 'New complaint submitted', 'CVD-2026-0003 — Frequent power outages in Mohammadpur', '/admin/tickets/t3', now() - interval '2 days'),
  ('u7', 'New complaint submitted', 'CVD-2026-0007 — Illegal construction noise at midnight', '/admin/tickets/t7', now() - interval '1 day'),
  ('u7', 'SLA breach warning', 'CVD-2026-0004 is approaching its SLA deadline', '/admin/tickets/t4', now() - interval '6 hours');
