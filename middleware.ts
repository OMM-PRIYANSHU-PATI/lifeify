import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/middleware";

const PROTECTED_PREFIXES = ["/app", "/settings", "/admin", "/api/records-file"];
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSessionFromRequest(req);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected) {
    if (!session) {
      const url = new URL("/login", req.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/app/dashboard", req.url));
    }
  }

  if (session && AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/app/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/settings/:path*", "/admin/:path*", "/login", "/signup", "/api/records-file/:path*"],
};
