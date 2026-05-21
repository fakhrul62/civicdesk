import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getTicket, getTicketAuditLogs } from "@/actions/tickets";
import { getMessages } from "@/actions/messages";
import { ComplaintDetailClient } from "./client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

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

  if (user.role !== "citizen") {
    redirect(`/admin/tickets/${id}`);
  }

  const ticket = await getTicket(id);

  if (!ticket || ticket.citizen_id !== user.id) {
    // Ticket not found or doesn't belong to this citizen
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Complaint Not Found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The complaint you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const messages = await getMessages(id, false); // Don't include internal notes for citizens

  // Fetch audit logs for the timeline
  const auditLogs = await getTicketAuditLogs(id);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <ComplaintDetailClient
        ticket={ticket}
        initialMessages={messages || []}
        user={user}
        auditLogs={auditLogs}
      />
      <Footer />
    </div>
  );
}
