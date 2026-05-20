import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getAnalyticsData } from "@/actions/admin";
import { AdminAnalyticsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();

  if (!user || user.role === "citizen") {
    redirect("/login");
  }

  const data = await getAnalyticsData();
  
  return <AdminAnalyticsClient data={data} />;
}
