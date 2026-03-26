import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
