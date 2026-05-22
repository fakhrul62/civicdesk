import { SignJWT } from "jose";
import { cookies } from "next/headers";
import {
  appSessionCookieName,
  getSessionSecret,
  sessionDurationSeconds,
  verifyAppSessionToken,
} from "@/lib/auth-session-token";

type SessionPayload = {
  sub: string;
  email: string;
  role: string;
};

export async function createAppSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${sessionDurationSeconds}s`)
    .sign(getSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(appSessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionDurationSeconds,
  });
}

export async function clearAppSession() {
  const cookieStore = await cookies();
  cookieStore.delete(appSessionCookieName);
}

export async function getAppSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(appSessionCookieName)?.value;

  return verifyAppSessionToken(token);
}
