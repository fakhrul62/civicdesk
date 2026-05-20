import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getTicket, getTicketAuditLogs } from "@/actions/tickets";
import { getMessages } from "@/actions/messages";
import { ComplaintDetailClient } from "./client";

export const dynamic = "force-dynamic";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Check if citizen
  if (user.role !== "citizen") {
    redirect("/admin");
  }

  const ticket = await getTicket(id);

  if (!ticket || ticket.citizen_id !== user.id) {
    // Ticket not found or doesn't belong to this citizen
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Complaint Not Found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The complaint you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  const messages = await getMessages(id, false); // Don't include internal notes for citizens

  // Fetch audit logs for the timeline
  const auditLogs = await getTicketAuditLogs(id);

  return (
    <ComplaintDetailClient 
      ticket={ticket} 
      initialMessages={messages || []} 
      user={user} 
      auditLogs={auditLogs}
    />
  );
}
