"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { cacheGetOrSet, cacheInvalidate } from "@/lib/redis";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────

export async function getDashboardStats() {
  return cacheGetOrSet(
    "civicdesk:dashboard:stats",
    async () => {
      const [
        totalTickets,
        openTickets,
        resolvedTickets,
        overdueTickets,
        recentTickets,
        statusDistribution,
        resolvedWithTimes,
      ] = await Promise.all([
        prisma.ticket.count(),
        prisma.ticket.count({
          where: {
            status: { notIn: ["resolved", "closed"] },
          },
        }),
        prisma.ticket.count({
          where: { status: { in: ["resolved", "closed"] } },
        }),
        prisma.ticket.count({
          where: {
            due_date: { lt: new Date() },
            status: { notIn: ["resolved", "closed"] },
          },
        }),
        prisma.ticket.findMany({
          take: 5,
          orderBy: { created_at: "desc" },
          include: {
            category: { select: { name: true } },
            citizen: { select: { full_name: true } },
            assigned_agent: { select: { full_name: true } },
          },
        }),
        prisma.ticket.groupBy({
          by: ["status"],
          _count: { id: true },
        }),
        prisma.ticket.findMany({
          where: { resolved_at: { not: null } },
          select: { created_at: true, resolved_at: true, due_date: true },
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

      const resolvedWithDueDates = resolvedWithTimes.filter((ticket) => ticket.due_date);
      const resolvedWithinSla = resolvedWithDueDates.filter(
        (ticket) => ticket.resolved_at! <= ticket.due_date!
      ).length;
      const slaCompliance =
        resolvedWithDueDates.length > 0
          ? Math.round((resolvedWithinSla / resolvedWithDueDates.length) * 100)
          : 0;

      return {
        totalTickets,
        openTickets,
        resolvedTickets,
        overdueTickets,
        recentTickets,
        statusDistribution: statusDistribution.map((item) => ({
          status: item.status,
          count: item._count.id,
        })),
        avgResolutionHours,
        slaCompliance,
      };
    },
    30 // Cache for 30 seconds
  );
}

// ─────────────────────────────────────────────
// AGENT STATS
// ─────────────────────────────────────────────

export async function getAgentStats() {
  const agents = await prisma.user.findMany({
    where: { role: { in: ["agent", "supervisor"] }, is_active: true },
    select: {
      id: true,
      full_name: true,
      email: true,
      role: true,
      assigned_tickets: {
        select: {
          status: true,
          resolved_at: true,
          created_at: true,
        },
      },
    },
  });

  return agents.map((agent) => {
    const open = agent.assigned_tickets.filter(
      (t) => !["resolved", "closed"].includes(t.status)
    ).length;

    const inProgress = agent.assigned_tickets.filter(
      (t) => t.status === "in_progress"
    ).length;

    const resolved = agent.assigned_tickets.filter(
      (t) => t.status === "resolved" || t.status === "closed"
    ).length;

    // Calculate average resolution time
    const resolvedTickets = agent.assigned_tickets.filter(
      (t) => t.resolved_at
    );
    const avgHours =
      resolvedTickets.length > 0
        ? Math.round(
            resolvedTickets.reduce(
              (sum, t) =>
                sum +
                (t.resolved_at!.getTime() - t.created_at.getTime()) /
                  (1000 * 60 * 60),
              0
            ) / resolvedTickets.length
          )
        : 0;

    return {
      id: agent.id,
      name: agent.full_name,
      email: agent.email,
      role: agent.role,
      open,
      inProgress,
      resolved,
      avgHours,
    };
  });
}

export async function getUsersForAdmin() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { created_at: "desc" }],
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      role: true,
      is_active: true,
      created_at: true,
      assigned_tickets: {
        select: { status: true },
      },
      submitted_tickets: {
        select: { status: true },
      },
    },
  });
}

export async function updateUserRole(data: {
  userId: string;
  role: "citizen" | "agent" | "supervisor" | "admin";
  is_active: boolean;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return { error: "Unauthorized" };

  const currentUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true },
  });

  if (currentUser?.role !== "admin") {
    return { error: "Only super admins can manage users" };
  }

  await prisma.user.update({
    where: { id: data.userId },
    data: {
      role: data.role,
      is_active: data.is_active,
    },
  });

  revalidatePath("/admin/agents");
  revalidatePath("/admin/tickets");
  return { success: true };
}

// ─────────────────────────────────────────────
// ANALYTICS DATA
// ─────────────────────────────────────────────

export async function getAnalyticsData() {
  return cacheGetOrSet(
    "civicdesk:analytics",
    async () => {
      // Category distribution
      const categoryDistribution = await prisma.ticket.groupBy({
        by: ["category_id"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      });

      const categories = await prisma.category.findMany({
        select: { id: true, name: true },
      });

      const categoryData = categoryDistribution.map((item) => ({
        name:
          categories.find((c) => c.id === item.category_id)?.name || "Unknown",
        count: item._count.id,
      }));

      // Status distribution
      const statusDistribution = await prisma.ticket.groupBy({
        by: ["status"],
        _count: { id: true },
      });

      // Monthly volume (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyTickets = await prisma.ticket.findMany({
        where: { created_at: { gte: sixMonthsAgo } },
        select: { created_at: true },
      });

      const monthlyVolume: Record<string, number> = {};
      monthlyTickets.forEach((t) => {
        const key = t.created_at.toISOString().slice(0, 7); // YYYY-MM
        monthlyVolume[key] = (monthlyVolume[key] || 0) + 1;
      });

      // Average resolution time
      const resolvedTickets = await prisma.ticket.findMany({
        where: { resolved_at: { not: null } },
        select: { created_at: true, resolved_at: true },
      });

      const avgResolutionHours =
        resolvedTickets.length > 0
          ? Math.round(
              resolvedTickets.reduce(
                (sum, t) =>
                  sum +
                  (t.resolved_at!.getTime() - t.created_at.getTime()) /
                    (1000 * 60 * 60),
                0
              ) / resolvedTickets.length
            )
          : 0;

      return {
        categoryData,
        statusDistribution: statusDistribution.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        monthlyVolume,
        avgResolutionHours,
        totalResolved: resolvedTickets.length,
      };
    },
    60 // Cache for 60 seconds
  );
}

// ─────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────

export async function getAuditLog(filters?: {
  search?: string;
  action?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 50;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters?.action && filters.action !== "all") {
    where.action = { contains: filters.action, mode: "insensitive" };
  }

  if (filters?.search) {
    where.OR = [
      { actor: { full_name: { contains: filters.search, mode: "insensitive" } } },
      { ticket: { ticket_number: { contains: filters.search, mode: "insensitive" } } },
      { action: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { full_name: true, role: true } },
        ticket: { select: { ticket_number: true } },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    entries,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────
// CATEGORY MANAGEMENT
// ─────────────────────────────────────────────

export async function getCategories() {
  return prisma.category.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(data: {
  name: string;
  department: string;
  description?: string;
  default_priority: "critical" | "high" | "medium" | "low";
  sla_hours: number;
}) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true },
  });

  if (!user || user.role !== "admin") {
    return { error: "Only admins can create categories" };
  }

  try {
    const category = await prisma.category.create({ data });
    await cacheInvalidate("civicdesk:categories");
    revalidatePath("/admin/settings");
    return { success: true, category };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: "A category with this name already exists" };
    }
    return { error: "Failed to create category" };
  }
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { role: true },
  });

  if (!user || user.role !== "admin") {
    return { error: "Only admins can delete categories" };
  }

  // Soft delete — mark as inactive
  await prisma.category.update({
    where: { id },
    data: { is_active: false },
  });

  await cacheInvalidate("civicdesk:categories");
  revalidatePath("/admin/settings");
  return { success: true };
}
