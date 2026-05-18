"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getSubmissionLimiter } from "@/lib/redis";
import {
  createTicketSchema,
  updateTicketStatusSchema,
  updateTicketPrioritySchema,
  assignAgentSchema,
  type CreateTicketInput,
  type UpdateTicketStatusInput,
  type UpdateTicketPriorityInput,
  type AssignAgentInput,
} from "@/lib/validations";
import { generateTicketNumber, calculateDueDate } from "@/lib/ticket-utils";
import {
  sendTicketConfirmation,
  sendStatusUpdate,
  sendAgentAssigned,
  sendResolutionNotice,
} from "@/lib/email";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// CREATE TICKET
// ─────────────────────────────────────────────

export async function createTicket(input: CreateTicketInput) {
  const parsed = createTicketSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
    const limiter = getSubmissionLimiter();
    const { success: allowed } = await limiter.limit(ip);

    if (!allowed) {
      return { error: "You've submitted too many complaints. Please try again in an hour." };
    }

    // Get current user
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return { error: "You must be logged in to submit a complaint" };
    }

    // Get category for SLA and default priority
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.category_id },
    });

    if (!category) {
      return { error: "Invalid category selected" };
    }

    // Generate ticket number
    const ticketNumber = await generateTicketNumber();

    // Calculate due date based on SLA
    const priority = parsed.data.priority || category.default_priority;
    const dueDate = calculateDueDate(category.sla_hours);

    // Create ticket with timeline event and audit log in a single transaction
    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.ticket.create({
        data: {
          ticket_number: ticketNumber,
          title: parsed.data.title,
          description: parsed.data.description,
          category_id: parsed.data.category_id,
          citizen_id: authUser.id,
          priority,
          location: parsed.data.location,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
          due_date: dueDate,
          status: "submitted",
        },
        include: {
          category: true,
          citizen: true,
        },
      });

      // Create timeline event
      await tx.timelineEvent.create({
        data: {
          ticket_id: newTicket.id,
          status: "submitted",
          description: "Complaint submitted",
          actor: newTicket.citizen.full_name,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          ticket_id: newTicket.id,
          actor_id: authUser.id,
          action: "Ticket created",
          field: "status",
          new_value: "Submitted",
          ip_address: ip,
        },
      });

      return newTicket;
    });

    // Send confirmation email (non-blocking)
    sendTicketConfirmation({
      ticketNumber: ticket.ticket_number,
      citizenName: ticket.citizen.full_name,
      citizenEmail: ticket.citizen.email,
      title: ticket.title,
      category: ticket.category.name,
    }).catch((err) => console.error("Email send error:", err));

    revalidatePath("/dashboard");
    revalidatePath("/admin");
    revalidatePath("/admin/tickets");

    return {
      success: true,
      ticketNumber: ticket.ticket_number,
      ticketId: ticket.id,
    };
  } catch (err: any) {
    console.error("Create ticket error:", err);
    return { error: "Failed to submit complaint. Please try again." };
  }
}

// ─────────────────────────────────────────────
// UPDATE TICKET STATUS
// ─────────────────────────────────────────────

export async function updateTicketStatus(input: UpdateTicketStatusInput) {
  const parsed = updateTicketStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return { error: "Unauthorized" };
    }

    // Verify user is agent/admin
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true, full_name: true },
    });

    if (!user || user.role === "citizen") {
      return { error: "Only agents and admins can update ticket status" };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: parsed.data.ticket_id },
      include: { citizen: true },
    });

    if (!ticket) {
      return { error: "Ticket not found" };
    }

    const oldStatus = ticket.status;
    const newStatus = parsed.data.status;

    if (oldStatus === newStatus) {
      return { error: "Status is already set to this value" };
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";

    const statusLabels: Record<string, string> = {
      submitted: "Submitted",
      under_review: "Under Review",
      in_progress: "In Progress",
      pending_citizen: "Pending Citizen",
      resolved: "Resolved",
      closed: "Closed",
    };

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: parsed.data.ticket_id },
        data: {
          status: newStatus,
          resolved_at: newStatus === "resolved" ? new Date() : undefined,
        },
      });

      await tx.timelineEvent.create({
        data: {
          ticket_id: parsed.data.ticket_id,
          status: newStatus,
          description: `Status changed to ${statusLabels[newStatus]}`,
          actor: user.full_name,
        },
      });

      await tx.auditLog.create({
        data: {
          ticket_id: parsed.data.ticket_id,
          actor_id: authUser.id,
          action: "Status changed",
          field: "status",
          old_value: statusLabels[oldStatus],
          new_value: statusLabels[newStatus],
          ip_address: ip,
        },
      });
    });

    // Send email notification (non-blocking)
    const emailFn = newStatus === "resolved" ? sendResolutionNotice : sendStatusUpdate;
    emailFn({
      ticketNumber: ticket.ticket_number,
      citizenName: ticket.citizen.full_name,
      citizenEmail: ticket.citizen.email,
      title: ticket.title,
      category: "",
      status: newStatus,
      message: parsed.data.message,
    }).catch((err) => console.error("Email send error:", err));

    revalidatePath(`/admin/tickets/${parsed.data.ticket_id}`);
    revalidatePath("/admin/tickets");
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Update status error:", err);
    return { error: "Failed to update ticket status" };
  }
}

// ─────────────────────────────────────────────
// UPDATE TICKET PRIORITY
// ─────────────────────────────────────────────

export async function updateTicketPriority(input: UpdateTicketPriorityInput) {
  const parsed = updateTicketPrioritySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return { error: "Unauthorized" };

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true, full_name: true },
    });

    if (!user || user.role === "citizen") {
      return { error: "Only agents and admins can update ticket priority" };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: parsed.data.ticket_id },
    });

    if (!ticket) return { error: "Ticket not found" };

    const oldPriority = ticket.priority;
    const newPriority = parsed.data.priority;

    if (oldPriority === newPriority) {
      return { error: "Priority is already set to this value" };
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";

    const priorityLabels: Record<string, string> = {
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low",
    };

    await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: parsed.data.ticket_id },
        data: { priority: newPriority },
      });

      await tx.auditLog.create({
        data: {
          ticket_id: parsed.data.ticket_id,
          actor_id: authUser.id,
          action: "Priority changed",
          field: "priority",
          old_value: priorityLabels[oldPriority],
          new_value: priorityLabels[newPriority],
          ip_address: ip,
        },
      });
    });

    revalidatePath(`/admin/tickets/${parsed.data.ticket_id}`);
    revalidatePath("/admin/tickets");

    return { success: true };
  } catch (err: any) {
    console.error("Update priority error:", err);
    return { error: "Failed to update ticket priority" };
  }
}

// ─────────────────────────────────────────────
// ASSIGN AGENT
// ─────────────────────────────────────────────

export async function assignAgent(input: AssignAgentInput) {
  const parsed = assignAgentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) return { error: "Unauthorized" };

    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true, full_name: true },
    });

    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "supervisor")) {
      return { error: "Only admins and supervisors can assign agents" };
    }

    const agent = await prisma.user.findUnique({
      where: { id: parsed.data.agent_id },
      select: { full_name: true, role: true },
    });

    if (!agent || (agent.role !== "agent" && agent.role !== "supervisor")) {
      return { error: "Selected user is not a valid agent" };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: parsed.data.ticket_id },
      include: { citizen: true },
    });

    if (!ticket) return { error: "Ticket not found" };

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";

    await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: parsed.data.ticket_id },
        data: { assigned_to: parsed.data.agent_id },
      });

      await tx.timelineEvent.create({
        data: {
          ticket_id: parsed.data.ticket_id,
          status: ticket.status,
          description: `Agent ${agent.full_name} assigned`,
          actor: currentUser.full_name,
        },
      });

      await tx.auditLog.create({
        data: {
          ticket_id: parsed.data.ticket_id,
          actor_id: authUser.id,
          action: "Assigned agent",
          field: "assigned_to",
          new_value: agent.full_name,
          ip_address: ip,
        },
      });
    });

    // Send email notification (non-blocking)
    sendAgentAssigned({
      ticketNumber: ticket.ticket_number,
      citizenName: ticket.citizen.full_name,
      citizenEmail: ticket.citizen.email,
      title: ticket.title,
      category: "",
      agentName: agent.full_name,
    }).catch((err) => console.error("Email send error:", err));

    revalidatePath(`/admin/tickets/${parsed.data.ticket_id}`);
    revalidatePath("/admin/tickets");
    revalidatePath("/admin/agents");

    return { success: true };
  } catch (err: any) {
    console.error("Assign agent error:", err);
    return { error: "Failed to assign agent" };
  }
}

// ─────────────────────────────────────────────
// GET TICKETS (with filters)
// ─────────────────────────────────────────────

export async function getTickets(filters?: {
  status?: string;
  priority?: string;
  search?: string;
  citizen_id?: string;
  agent_id?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }
  if (filters?.priority && filters.priority !== "all") {
    where.priority = filters.priority;
  }
  if (filters?.citizen_id) {
    where.citizen_id = filters.citizen_id;
  }
  if (filters?.agent_id) {
    where.assigned_to = filters.agent_id;
  }
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { ticket_number: { contains: filters.search, mode: "insensitive" } },
      { citizen: { full_name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        category: { select: { name: true, department: true } },
        citizen: { select: { full_name: true, email: true } },
        assigned_agent: { select: { full_name: true } },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    tickets,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

// ─────────────────────────────────────────────
// GET SINGLE TICKET
// ─────────────────────────────────────────────

export async function getTicket(id: string) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      category: true,
      citizen: { select: { id: true, full_name: true, email: true, phone: true } },
      assigned_agent: { select: { id: true, full_name: true, email: true } },
      messages: {
        orderBy: { created_at: "asc" },
        include: {
          sender: { select: { id: true, full_name: true, role: true } },
        },
      },
      attachments: true,
      timeline_events: { orderBy: { created_at: "asc" } },
      audit_entries: {
        orderBy: { created_at: "desc" },
        include: {
          actor: { select: { full_name: true, role: true } },
        },
      },
    },
  });
}

// ─────────────────────────────────────────────
// GET TICKET BY NUMBER (for public tracking)
// ─────────────────────────────────────────────

export async function getTicketByNumber(ticketNumber: string) {
  return prisma.ticket.findUnique({
    where: { ticket_number: ticketNumber },
    include: {
      category: { select: { name: true } },
      assigned_agent: { select: { full_name: true } },
      timeline_events: { orderBy: { created_at: "asc" } },
      messages: {
        where: { is_internal: false }, // Only public messages
        orderBy: { created_at: "asc" },
        include: {
          sender: { select: { full_name: true, role: true } },
        },
      },
    },
  });
}
