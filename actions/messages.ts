"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { sendMessageSchema, type SendMessageInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────
// SEND MESSAGE
// ─────────────────────────────────────────────

export async function sendMessage(input: SendMessageInput) {
  const parsed = sendMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return { error: "You must be logged in to send a message" };
    }

    // Get user from our database
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true, full_name: true },
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Verify the ticket exists and user has access
    const ticket = await prisma.ticket.findUnique({
      where: { id: parsed.data.ticket_id },
      select: { citizen_id: true },
    });

    if (!ticket) {
      return { error: "Ticket not found" };
    }

    // Citizens can only message their own tickets and can't send internal messages
    if (user.role === "citizen") {
      if (ticket.citizen_id !== authUser.id) {
        return { error: "You can only message your own complaints" };
      }
      if (parsed.data.is_internal) {
        return { error: "Citizens cannot send internal notes" };
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        ticket_id: parsed.data.ticket_id,
        sender_id: authUser.id,
        body: parsed.data.body,
        is_internal: parsed.data.is_internal,
      },
      include: {
        sender: { select: { full_name: true, role: true } },
      },
    });

    // Update ticket's updated_at
    await prisma.ticket.update({
      where: { id: parsed.data.ticket_id },
      data: { updated_at: new Date() },
    });

    revalidatePath(`/complaints/${parsed.data.ticket_id}`);
    revalidatePath(`/admin/tickets/${parsed.data.ticket_id}`);

    return { success: true, message };
  } catch (err: any) {
    console.error("Send message error:", err);
    return { error: "Failed to send message" };
  }
}

// ─────────────────────────────────────────────
// GET MESSAGES FOR A TICKET
// ─────────────────────────────────────────────

export async function getMessages(ticketId: string, includeInternal: boolean = false) {
  const where: any = { ticket_id: ticketId };

  if (!includeInternal) {
    where.is_internal = false;
  }

  return prisma.message.findMany({
    where,
    orderBy: { created_at: "asc" },
    include: {
      sender: {
        select: { id: true, full_name: true, role: true, avatar_url: true },
      },
    },
  });
}
