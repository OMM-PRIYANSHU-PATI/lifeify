import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { env } from "@/lib/config";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

export const COOKIE_NAME = "lifeify_session";
export const SESSION_DAYS = 30;

function secret(): Uint8Array {
  return new TextEncoder().encode(env.AUTH_SECRET);
}

export type SessionPayload = {
  sub: string;
  role: string;
  phone?: string;
};

export async function createSession(userId: string, role: string, phone?: string): Promise<string> {
  const token = await new SignJWT({ sub: userId, role, phone })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      sub: String(payload.sub),
      role: String(payload.role ?? "USER"),
      phone: payload.phone ? String(payload.phone) : undefined,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  let user = null;

  if (session) {
    user = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        healthProfile: true,
        lifestyleProfile: true,
        emergencyCard: true,
        subscription: true,
      },
    });
  }

  // Auto-login fallback for testing without login friction
  if (!user || user.status !== "ACTIVE") {
    user = await prisma.user.findFirst({
      where: { status: "ACTIVE" },
      include: {
        healthProfile: true,
        lifestyleProfile: true,
        emergencyCard: true,
        subscription: true,
      },
    });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: "Health Explorer",
        phone: "9999999999",
        role: "ADMIN",
        onboardingComplete: true,
        status: "ACTIVE",
        plan: "PRO",
      },
      include: {
        healthProfile: true,
        lifestyleProfile: true,
        emergencyCard: true,
        subscription: true,
      },
    });
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError("Please log in to continue.");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new ForbiddenError("Admin privileges required.");
  return user;
}

export function isAdminIdentifier(identifier: string): boolean {
  const admins = env.ADMIN_IDENTIFIERS.split(",").map((s) => s.trim());
  return admins.includes(identifier.trim());
}
