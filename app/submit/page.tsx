import { getCurrentUser } from "@/actions/auth";
import { getCategories } from "@/actions/admin";
import { SubmitClient } from "./client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const user = await getCurrentUser();

  // Fetch active categories
  const categories = await getCategories();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <SubmitClient user={user} categories={categories || []} />
      <Footer />
    </div>
  );
}
