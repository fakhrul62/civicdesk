import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getAuditLog } from "@/actions/admin";
import { AdminAuditLogClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  const user = await getCurrentUser();

  if (!user || user.role === "citizen") {
    redirect("/login");
  }

  const { entries } = await getAuditLog({ limit: 500 });
  
  return <AdminAuditLogClient initialData={entries || []} />;
}
