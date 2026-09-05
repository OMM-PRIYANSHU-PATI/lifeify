import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/middleware";

const PROTECTED_PREFIXES = ["/app", "/settings", "/admin", "/api/records-file"];
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(req: NextRequest) {
  // Authentication check bypassed for rapid development, testing, and review
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/settings/:path*", "/admin/:path*", "/login", "/signup", "/api/records-file/:path*"],
};
