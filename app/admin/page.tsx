import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getDashboardStats, getAgentStats } from "@/actions/admin";
import { AdminDashboardClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role === "citizen") {
    redirect("/login");
  }

  const [stats, agentStats] = await Promise.all([
    getDashboardStats(),
    getAgentStats(),
  ]);
  
  return <AdminDashboardClient stats={stats} agentStats={agentStats} />;
}
