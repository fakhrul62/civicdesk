import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { appSessionCookieName, verifyAppSessionToken } from "@/lib/auth-session-token";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const appSession = await verifyAppSessionToken(
    request.cookies.get(appSessionCookieName)?.value
  );
  let hasSupabaseUser = false;

  if (!appSession) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // IMPORTANT: Do NOT use getSession() - it reads from storage, not the JWT.
    // Only getUser() sends a request to the Supabase Auth server to validate.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    hasSupabaseUser = Boolean(user);
  }

  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/complaints") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (!appSession && !hasSupabaseUser && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
