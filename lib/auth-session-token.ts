import { jwtVerify } from "jose";

export const appSessionCookieName = "civicdesk_session";
export const sessionDurationSeconds = 60 * 60 * 24 * 7;

export function getSessionSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable.");
  }

  return new TextEncoder().encode(secret);
}

export async function verifyAppSessionToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());

    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }

    return {
      userId: payload.sub,
      email: String(payload.email),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}
