import { redirect } from "next/navigation";
import { clearAppSession } from "@/lib/auth-session";

export async function GET() {
  await clearAppSession();
  redirect("/");
}
