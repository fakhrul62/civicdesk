-- CivicDesk production-safe seed data.
-- This file only creates complaint categories. It does not create users,
-- complaints, messages, attachments, audit logs, or ticket records.

WITH desired_categories(name, department, description, default_priority, sla_hours) AS (
  VALUES
    ('Road Damage & Potholes', 'Roads and Footpaths', 'Broken roads, potholes, damaged footpaths, unsafe pedestrian paths, and bridge or culvert issues.', 'high'::"Priority", 48),
    ('Drainage & Waterlogging', 'Drainage and Canal Maintenance', 'Clogged drains, overflowing drains, stagnant rainwater, canal blockage, and monsoon waterlogging.', 'critical'::"Priority", 24),
    ('Garbage & Waste Collection', 'Waste Management', 'Missed waste pickup, roadside garbage piles, illegal dumping, overflowing bins, and market waste.', 'high'::"Priority", 48),
    ('Mosquito & Dengue Control', 'Public Health and Vector Control', 'Mosquito breeding sites, stagnant water, missed fogging or larvicide, and dengue-risk complaints.', 'critical'::"Priority", 24),
    ('Street Light & Electrical Safety', 'Street Lighting', 'Broken streetlights, exposed wiring, unsafe poles, dark roads, and public electrical hazards.', 'high'::"Priority", 36),
    ('Open Manhole & Sewerage', 'Sewerage and Drain Safety', 'Open manholes, broken sewer covers, sewage overflow, and dangerous drain openings.', 'critical'::"Priority", 12),
    ('Water Supply & Quality', 'Water Supply', 'No water supply, low pressure, pipe leaks, contaminated water, and burst lines.', 'critical'::"Priority", 24),
    ('Public Toilet & Sanitation', 'Public Sanitation', 'Dirty public toilets, locked facilities, broken fixtures, and sanitation access issues.', 'medium'::"Priority", 72),
    ('Illegal Structure & Encroachment', 'Urban Planning and Enforcement', 'Illegal construction, footpath occupation, drain or canal encroachment, and unsafe structures.', 'high'::"Priority", 72),
    ('Noise & Air Pollution', 'Environment and Enforcement', 'Construction noise, loudspeakers, industrial noise, dust, smoke, and local air pollution.', 'medium'::"Priority", 72),
    ('Traffic Signal & Road Safety', 'Traffic Engineering', 'Broken signals, missing signs, dangerous crossings, speed breaker requests, and road safety hazards.', 'high'::"Priority", 48),
    ('Parks, Trees & Public Spaces', 'Urban Green and Public Spaces', 'Fallen trees, unsafe branches, park maintenance, playground damage, and public space repairs.', 'medium'::"Priority", 96)
)
INSERT INTO categories (id, name, department, description, default_priority, sla_hours, is_active, created_at, updated_at)
SELECT gen_random_uuid()::text, name, department, description, default_priority, sla_hours, true, now(), now()
FROM desired_categories
ON CONFLICT (name) DO UPDATE SET
  department = EXCLUDED.department,
  description = EXCLUDED.description,
  default_priority = EXCLUDED.default_priority,
  sla_hours = EXCLUDED.sla_hours,
  is_active = true,
  updated_at = now();

UPDATE categories
SET is_active = false, updated_at = now()
WHERE name NOT IN (SELECT name FROM desired_categories);
