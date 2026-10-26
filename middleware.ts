import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, isValidAdminSession } from "@/lib/admin-auth";
import { updateSession } from "@/lib/supabase/middleware";

// /admin/*     — shared-password session cookie (placeholder auth, see lib/admin-auth.ts).
// /dashboard/* — business owner's Supabase Auth session.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const { response, user } = await updateSession(request);
    if (pathname === "/dashboard/login") {
      return user ? NextResponse.redirect(new URL("/dashboard", request.url)) : response;
    }
    return user ? response : NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  const loggedIn = await isValidAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return loggedIn ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }
  if (!loggedIn) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/dashboard", "/dashboard/:path*"],
};
