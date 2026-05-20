import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HomeClient } from "./page-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    totalTickets,
    resolvedTickets,
    activeCitizens,
    resolvedWithTimes,
    categories,
  ] = await Promise.all([
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <HomeClient
        stats={{
          totalTickets,
          resolvedTickets,
          activeCitizens,
          avgResolutionHours,
        }}
        categories={categories.map((category) => ({
          name: category.name,
          count: category.tickets.length,
        }))}
      />
      <Footer />
    </div>
  );
}
