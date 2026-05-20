import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getAgentStats, getUsersForAdmin } from "@/actions/admin";
import { AdminAgentsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminAgentsPage() {
  const user = await getCurrentUser();

  if (!user || user.role === "citizen") {
    redirect("/login");
  }

  const [agentStats, users] = await Promise.all([
    getAgentStats(),
    user.role === "admin" ? getUsersForAdmin() : Promise.resolve([]),
  ]);

  return <AdminAgentsClient agentStats={agentStats} users={users} currentUser={user} />;
}
