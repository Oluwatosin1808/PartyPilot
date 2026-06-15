import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/events"];

export function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSupabaseCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  if (!hasSupabaseCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/events/:path*"],
};
