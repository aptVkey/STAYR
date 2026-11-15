import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE, UNLOCK_PARAM, UNLOCK_VALUE } from "@/lib/access";

const ADMIN_COOKIE = "stayr_admin";

/**
 * Two redirects, neither of which is the security boundary:
 *
 *  - /case-study: visitors who have not completed the opt-in are sent to the
 *    homepage, where the opt-in modal opens. A funnel step, not access
 *    control — see src/lib/access.ts.
 *  - /admin: visitors without a session cookie are sent to the login. The
 *    admin pages are empty shells; every piece of data comes from
 *    /api/admin/*, which verifies the signed session on each request
 *    (src/lib/admin/auth.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || request.cookies.get(ADMIN_COOKIE)?.value) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (request.cookies.get(ACCESS_COOKIE)?.value === "1") {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = `?${UNLOCK_PARAM}=${UNLOCK_VALUE}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/case-study", "/admin/:path*"],
};
