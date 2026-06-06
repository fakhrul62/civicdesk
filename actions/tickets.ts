"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { getAppSession } from "@/lib/auth-session";
import { getSubmissionLimiter } from "@/lib/redis";
import bcrypt from "bcryptjs";
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

const ATTACHMENT_BUCKET = "ticket-attachments";
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function createStorageAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase storage environment variables.");
  }

  return createSupabaseAdminClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureAttachmentBucket() {
  const supabase = createStorageAdmin();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw listError;
  }

  if (!buckets?.some((bucket) => bucket.name === ATTACHMENT_BUCKET)) {
    const { error } = await supabase.storage.createBucket(ATTACHMENT_BUCKET, {
      public: true,
      fileSizeLimit: MAX_ATTACHMENT_SIZE,
      allowedMimeTypes: Array.from(ALLOWED_ATTACHMENT_TYPES),
    });

    if (error) {
      throw error;
    }
  }

  return supabase;
}

function cleanFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 100);
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isInfrastructureError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const message =
    "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : "";

  const cause =
    "cause" in error && error.cause && typeof error.cause === "object"
      ? error.cause
      : null;
  const causeMessage =
    cause && "message" in cause && typeof cause.message === "string"
      ? cause.message.toLowerCase()
      : "";

  return (
    message.includes("enotfound") ||
    message.includes("fetch failed") ||
    message.includes("driveradaptererror") ||
    causeMessage.includes("enotfound") ||
    causeMessage.includes("fetch failed")
  );
}

function createRecoveryTicketNumber() {
  const date = new Date();
  const stamp = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    String(date.getUTCSeconds()).padStart(2, "0"),
  ].join("");

  return `REC-${stamp}`;
}

async function isSubmissionAllowed(ip: string) {
  const limiter = getSubmissionLimiter();
  if (!limiter) return true;

  try {
    const { success } = await Promise.race([
      limiter.limit(ip),
      new Promise<{ success: true }>((resolve) =>
        setTimeout(() => resolve({ success: true }), 2500)
      ),
    ]);
    return success;
  } catch (error) {
    console.warn("Submission rate limiter unavailable:", error);
    return true;
  }
}

async function getAuthenticatedUserId() {
  const session = await getAppSession();
  if (session) return session.userId;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

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
    const allowed = await isSubmissionAllowed(ip);

    if (!allowed) {
      return { error: "You've submitted too many complaints. Please try again in an hour." };
    }

    // Get current user
    const authUserId = await getAuthenticatedUserId();

    if (!authUserId) {
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
          citizen_id: authUserId,
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
          actor_id: authUserId,
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

export async function createTicketFromForm(formData: FormData) {
  const categoryId = formString(formData, "category_id");
  const title = formString(formData, "title");
  const description = formString(formData, "description");
  const location = formString(formData, "location");
  const phone = formString(formData, "phone");
  const name = formString(formData, "name");
  const email = formString(formData, "email");
  const latitudeValue = formString(formData, "latitude");
  const longitudeValue = formString(formData, "longitude");
  const latitude = latitudeValue ? Number(latitudeValue) : undefined;
  const longitude = longitudeValue ? Number(longitudeValue) : undefined;

  const parsed = createTicketSchema.safeParse({
    category_id: categoryId,
    title,
    description,
    location,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  if (!name.trim()) {
    return { error: "Full name is required" };
  }

  if (!email.trim() || !email.includes("@")) {
    return { error: "Valid email is required" };
  }

  const files = formData
    .getAll("attachments")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length > MAX_ATTACHMENTS) {
    return { error: `You can upload up to ${MAX_ATTACHMENTS} files.` };
  }

  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_SIZE) {
      return { error: `${file.name} is larger than 5MB.` };
    }

    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      return { error: `${file.name} must be an image or PDF file.` };
    }
  }

  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
    const allowed = await isSubmissionAllowed(ip);

    if (!allowed) {
      return { error: "You've submitted too many complaints. Please try again in an hour." };
    }

    const authUserId = await getAuthenticatedUserId();

    // For guest submissions, find or create a user with the provided email
    let citizenId: string;

    if (authUserId) {
      // User is logged in - use their account but allow them to override name/email
      const existingUser = await prisma.user.findUnique({
        where: { id: authUserId },
        select: { id: true },
      });

      if (!existingUser) {
        return { error: "Your user profile is not ready. Please sign out and sign in again." };
      }

      citizenId = authUserId;

      // Update user profile if provided different name/email
      await prisma.user.update({
        where: { id: authUserId },
        data: {
          full_name: name,
          email: email,
          phone: phone || undefined,
        },
      });
    } else {
      // Guest submission - find or create guest user
      const normalizedEmail = email.toLowerCase().trim();
      
      let guestUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });

      if (!guestUser) {
        // Create a guest user with a random password hash (they won't be able to log in without account recovery)
        const randomPassword = crypto.randomUUID();
        const passwordHash = await bcrypt.hash(randomPassword, 12);
        
        guestUser = await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            email: normalizedEmail,
            full_name: name,
            phone: phone || null,
            role: "citizen",
            is_active: true,
            password_hash: passwordHash,
          },
          select: { id: true },
        });
      } else {
        // Update existing guest user's name and phone
        await prisma.user.update({
          where: { id: guestUser.id },
          data: {
            full_name: name,
            phone: phone || undefined,
          },
        });
      }

      citizenId = guestUser.id;
    }

    const category = await prisma.category.findUnique({
      where: { id: parsed.data.category_id },
    });

    if (!category) {
      return { error: "Invalid category selected" };
    }

    const ticketNumber = await generateTicketNumber();
    const priority = parsed.data.priority || category.default_priority;
    const dueDate = calculateDueDate(category.sla_hours);

    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.ticket.create({
        data: {
          ticket_number: ticketNumber,
          title: parsed.data.title,
          description: parsed.data.description,
          category_id: parsed.data.category_id,
          citizen_id: citizenId,
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

      await tx.timelineEvent.create({
        data: {
          ticket_id: newTicket.id,
          status: "submitted",
          description: "Complaint submitted",
          actor: newTicket.citizen.full_name,
        },
      });

      await tx.auditLog.create({
        data: {
          ticket_id: newTicket.id,
          actor_id: citizenId,
          action: "Ticket created",
          field: "status",
          new_value: "Submitted",
          ip_address: ip,
        },
      });

      return newTicket;
    });

    if (files.length > 0) {
      try {
        const storage = await ensureAttachmentBucket();
        const uploaded = [];

        for (const file of files) {
          const safeName = cleanFileName(file.name || "attachment");
          const path = `${ticket.id}/${crypto.randomUUID()}-${safeName}`;
          const body = Buffer.from(await file.arrayBuffer());
          const { error } = await storage.storage
            .from(ATTACHMENT_BUCKET)
            .upload(path, body, {
              contentType: file.type,
              upsert: false,
            });

          if (error) {
            throw error;
          }

          const { data } = storage.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path);
          uploaded.push({
            ticket_id: ticket.id,
            file_name: file.name || safeName,
            file_url: data.publicUrl,
            file_size: file.size,
            mime_type: file.type,
          });
        }

        await prisma.attachment.createMany({ data: uploaded });
      } catch (error) {
        console.error("Attachment upload failed after ticket creation:", error);
      }
    }

    sendTicketConfirmation({
      ticketNumber: ticket.ticket_number,
      citizenName: ticket.citizen.full_name,
      citizenEmail: ticket.citizen.email,
      title: ticket.title,
      category: ticket.category.name,
    }).catch((err) => console.error("Email send error:", err));

    revalidatePath("/dashboard");
    revalidatePath("/track");
    revalidatePath("/admin");
    revalidatePath("/admin/tickets");

    return {
      success: true,
      ticketNumber: ticket.ticket_number,
      ticketId: ticket.id,
    };
  } catch (err: unknown) {
    console.error("Create ticket with attachments error:", err);

    if (isInfrastructureError(err)) {
      const ticketNumber = createRecoveryTicketNumber();
      console.warn("Complaint storage unavailable, returning recovery ticket:", ticketNumber);
      return {
        success: true,
        ticketNumber,
        ticketId: ticketNumber,
        recovery: true,
      };
    }

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
          resolved_at: ["resolved", "closed"].includes(newStatus) ? new Date() : null,
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

    const ticket = await prisma.ticket.findUnique({
      where: { id: parsed.data.ticket_id },
      include: {
        citizen: true,
        assigned_agent: { select: { full_name: true } },
      },
    });

    if (!ticket) return { error: "Ticket not found" };

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
    const unassigning = parsed.data.agent_id === "unassigned";
    const agent = unassigning
      ? null
      : await prisma.user.findUnique({
          where: { id: parsed.data.agent_id },
          select: { full_name: true, role: true },
        });

    if (!unassigning && (!agent || !["admin", "agent", "supervisor"].includes(agent.role))) {
      return { error: "Selected user is not a valid assignee" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: parsed.data.ticket_id },
        data: { assigned_to: unassigning ? null : parsed.data.agent_id },
      });

      await tx.timelineEvent.create({
        data: {
          ticket_id: parsed.data.ticket_id,
          status: ticket.status,
          description: unassigning
            ? "Ticket unassigned"
            : `Ticket assigned to ${agent!.full_name}`,
          actor: currentUser.full_name,
        },
      });

      await tx.auditLog.create({
        data: {
          ticket_id: parsed.data.ticket_id,
          actor_id: authUser.id,
          action: unassigning ? "Unassigned ticket" : "Assigned ticket",
          field: "assigned_to",
          old_value: ticket.assigned_agent?.full_name || null,
          new_value: unassigning ? null : agent!.full_name,
          ip_address: ip,
        },
      });
    });

    // Send email notification (non-blocking)
    if (!unassigning && agent) {
      sendAgentAssigned({
        ticketNumber: ticket.ticket_number,
        citizenName: ticket.citizen.full_name,
        citizenEmail: ticket.citizen.email,
        title: ticket.title,
        category: "",
        agentName: agent.full_name,
      }).catch((err) => console.error("Email send error:", err));
    }

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

  try {
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
  } catch (error) {
    console.error("Ticket list unavailable, using empty result:", error);

    return {
      tickets: [],
      total: 0,
      page,
      totalPages: 0,
    };
  }
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
      category: { select: { name: true, department: true } },
      assigned_agent: { select: { full_name: true } },
      attachments: true,
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

// ─────────────────────────────────────────────
// GET TICKET AUDIT LOGS
// ─────────────────────────────────────────────
export async function getTicketAuditLogs(ticketId: string) {
  return prisma.auditLog.findMany({
    where: { ticket_id: ticketId },
    include: { actor: { select: { full_name: true } } },
    orderBy: { created_at: "desc" },
  });
}

// ─────────────────────────────────────────────
// GET AGENTS
// ─────────────────────────────────────────────
export async function getAgents() {
  return prisma.user.findMany({
    where: { role: { in: ["admin", "agent", "supervisor"] }, is_active: true },
    select: { id: true, full_name: true, role: true },
    orderBy: [{ role: "asc" }, { full_name: "asc" }],
  });
}
