import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const categories = [
  {
    name: "Road Damage & Potholes",
    department: "Roads and Footpaths",
    description:
      "Broken roads, potholes, damaged footpaths, unsafe pedestrian paths, and bridge or culvert issues.",
    default_priority: "high" as const,
    sla_hours: 48,
  },
  {
    name: "Drainage & Waterlogging",
    department: "Drainage and Canal Maintenance",
    description:
      "Clogged drains, overflowing drains, stagnant rainwater, canal blockage, and monsoon waterlogging.",
    default_priority: "critical" as const,
    sla_hours: 24,
  },
  {
    name: "Garbage & Waste Collection",
    department: "Waste Management",
    description:
      "Missed waste pickup, roadside garbage piles, illegal dumping, overflowing bins, and market waste.",
    default_priority: "high" as const,
    sla_hours: 48,
  },
  {
    name: "Mosquito & Dengue Control",
    department: "Public Health and Vector Control",
    description:
      "Mosquito breeding sites, stagnant water, missed fogging or larvicide, and dengue-risk complaints.",
    default_priority: "critical" as const,
    sla_hours: 24,
  },
  {
    name: "Street Light & Electrical Safety",
    department: "Street Lighting",
    description:
      "Broken streetlights, exposed wiring, unsafe poles, dark roads, and public electrical hazards.",
    default_priority: "high" as const,
    sla_hours: 36,
  },
  {
    name: "Open Manhole & Sewerage",
    department: "Sewerage and Drain Safety",
    description:
      "Open manholes, broken sewer covers, sewage overflow, and dangerous drain openings.",
    default_priority: "critical" as const,
    sla_hours: 12,
  },
  {
    name: "Water Supply & Quality",
    department: "Water Supply",
    description:
      "No water supply, low pressure, pipe leaks, contaminated water, and burst lines.",
    default_priority: "critical" as const,
    sla_hours: 24,
  },
  {
    name: "Public Toilet & Sanitation",
    department: "Public Sanitation",
    description:
      "Dirty public toilets, locked facilities, broken fixtures, and sanitation access issues.",
    default_priority: "medium" as const,
    sla_hours: 72,
  },
  {
    name: "Illegal Structure & Encroachment",
    department: "Urban Planning and Enforcement",
    description:
      "Illegal construction, footpath occupation, drain or canal encroachment, and unsafe structures.",
    default_priority: "high" as const,
    sla_hours: 72,
  },
  {
    name: "Noise & Air Pollution",
    department: "Environment and Enforcement",
    description:
      "Construction noise, loudspeakers, industrial noise, dust, smoke, and local air pollution.",
    default_priority: "medium" as const,
    sla_hours: 72,
  },
  {
    name: "Traffic Signal & Road Safety",
    department: "Traffic Engineering",
    description:
      "Broken signals, missing signs, dangerous crossings, speed breaker requests, and road safety hazards.",
    default_priority: "high" as const,
    sla_hours: 48,
  },
  {
    name: "Parks, Trees & Public Spaces",
    department: "Urban Green and Public Spaces",
    description:
      "Fallen trees, unsafe branches, park maintenance, playground damage, and public space repairs.",
    default_priority: "medium" as const,
    sla_hours: 96,
  },
];

async function main() {
  console.log("Seeding CivicDesk complaint categories...");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { ...category, is_active: true },
      create: { ...category, is_active: true },
    });
  }

  await prisma.category.updateMany({
    where: { name: { notIn: categories.map((category) => category.name) } },
    data: { is_active: false },
  });

  console.log(`Seeded ${categories.length} active complaint categories.`);
  console.log("No users, complaints, messages, or ticket data are created by this seed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
