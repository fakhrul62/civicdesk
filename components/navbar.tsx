import { getCurrentUser } from "@/actions/auth";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  const user = await getCurrentUser();
  return <NavbarClient user={user} />;
}
