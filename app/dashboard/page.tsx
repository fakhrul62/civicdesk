import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getTickets } from "@/actions/tickets";
import { DashboardClient } from "./client";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Redirect staff to admin portal
  if (["admin", "supervisor", "agent"].includes(user.role)) {
    redirect("/admin");
  }

  // Fetch only this citizen's tickets
  const { tickets } = await getTickets({ citizen_id: user.id, limit: 100 });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <DashboardClient user={user} initialTickets={tickets} />
      <Footer />
    </div>
  );
}
