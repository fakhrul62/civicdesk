import { NextResponse, type NextRequest } from "next/server";
import { appSessionCookieName, verifyAppSessionToken } from "@/lib/auth-session-token";

export async function updateSession(request: NextRequest) {
  const appSession = await verifyAppSessionToken(
    request.cookies.get(appSessionCookieName)?.value
  );

  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/complaints") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (!appSession && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
