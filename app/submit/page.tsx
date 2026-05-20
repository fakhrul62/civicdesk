import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getCategories } from "@/actions/admin";
import { SubmitClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch active categories
  const categories = await getCategories();
  
  return <SubmitClient user={user} categories={categories || []} />;
}
