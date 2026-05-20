import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getTickets } from "@/actions/tickets";
import { AdminTicketsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminTicketsPage() {
  const user = await getCurrentUser();

  if (!user || user.role === "citizen") {
    redirect("/login");
  }

  const data = await getTickets({ limit: 500 });
  
  return <AdminTicketsClient initialData={data} />;
}
