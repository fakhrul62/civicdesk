import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HomeClient } from "./page-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fallbackStats = {
  totalTickets: 1284,
  resolvedTickets: 973,
  activeCitizens: 642,
  avgResolutionHours: 36,
};

const fallbackCategories = [
  { name: "Roads & Infrastructure", count: 342 },
  { name: "Water Supply", count: 218 },
  { name: "Waste Management", count: 186 },
  { name: "Electricity", count: 144 },
  { name: "Public Safety", count: 97 },
  { name: "Permits & Certificates", count: 82 },
];

async function getHomeData() {
  try {
    const [
      totalTickets,
      resolvedTickets,
      activeCitizens,
      resolvedWithTimes,
      categories,
    ] = await Promise.race([
      Promise.all([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: { in: ["resolved", "closed"] } } }),
      prisma.user.count({ where: { role: "citizen", is_active: true } }),
      prisma.ticket.findMany({
        where: { resolved_at: { not: null } },
        select: { created_at: true, resolved_at: true },
      }),
      prisma.category.findMany({
        where: { is_active: true },
        orderBy: { name: "asc" },
        select: {
          name: true,
          tickets: { select: { id: true } },
        },
      }),
      ]),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Homepage data timeout")), 5000)
      ),
    ]);

    const avgResolutionHours =
      resolvedWithTimes.length > 0
        ? Math.round(
            resolvedWithTimes.reduce((total, ticket) => {
              return (
                total +
                (ticket.resolved_at!.getTime() - ticket.created_at.getTime()) /
                  (1000 * 60 * 60)
              );
            }, 0) / resolvedWithTimes.length
          )
        : 0;

    return {
      stats: {
        totalTickets,
        resolvedTickets,
        activeCitizens,
        avgResolutionHours,
      },
      categories: categories.map((category) => ({
        name: category.name,
        count: category.tickets.length,
      })),
    };
  } catch (error) {
    console.error("Homepage data unavailable, using fallback content:", error);

    return {
      stats: fallbackStats,
      categories: fallbackCategories,
    };
  }
}

export default async function HomePage() {
  const { stats, categories } = await getHomeData();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <HomeClient stats={stats} categories={categories} />
      <Footer />
    </div>
  );
}
