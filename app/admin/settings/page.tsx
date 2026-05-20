import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getCategories } from "@/actions/admin";
import { AdminSettingsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  if (!user || user.role === "citizen") {
    redirect("/login");
  }

  const categories = await getCategories();
  
  return <AdminSettingsClient categories={categories || []} />;
}
