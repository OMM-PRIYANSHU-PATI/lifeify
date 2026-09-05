import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export const COOKIE_NAME = "lifeify_session";

export interface MiddlewareSession {
  sub: string;
  role: string;
}

export async function getSessionFromRequest(req: NextRequest): Promise<MiddlewareSession | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (!payload.sub) return null;
    return {
      sub: String(payload.sub),
      role: String(payload.role ?? "USER"),
    };
  } catch {
    return null;
  }
}
