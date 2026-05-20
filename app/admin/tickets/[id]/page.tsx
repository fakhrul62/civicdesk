import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getTicket, getTicketAuditLogs, getAgents } from "@/actions/tickets";
import { getMessages } from "@/actions/messages";
import { AdminTicketDetailClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user || user.role === "citizen") {
    redirect("/login");
  }

  const ticket = await getTicket(id);

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Ticket Not Found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The ticket you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const messages = await getMessages(id, true); // Admin gets internal notes

  // Fetch audit logs for the timeline
  const auditLogs = await getTicketAuditLogs(id);

  const agents = await getAgents();

  return (
    <AdminTicketDetailClient 
      ticket={ticket} 
      initialMessages={messages || []} 
      auditLogs={auditLogs}
      agents={agents}
      user={user}
    />
  );
}
