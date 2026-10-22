import { platformSessionMiddleware } from "@loftlancer/auth/platform-middleware";
import { DEFAULT_AUTH_URL } from "@loftlancer/env/platform";
import { resolvePublicServiceUrl } from "@loftlancer/env/vercel-services";
import { type NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/base-path";
import { setPrivateNoStore } from "@/lib/private-response";

const appOrigin = (
  process.env.NEXT_PUBLIC_AUTH_URL ??
  (process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("auth")
    : DEFAULT_AUTH_URL)
).replace(/\/$/, "");

const LEGACY_TAB_PATHS: Record<string, string> = {
  profile: "/settings/profile",
  sessions: "/settings/sessions",
  accounts: "/settings/accounts",
  export: "/settings/danger",
  delete: "/settings/danger",
  timeline: "/settings/timeline",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/account" || pathname.startsWith("/account/")) {
    const suffix = pathname.replace(/^\/account/, "") || "";
    return NextResponse.redirect(appUrl(request, `/settings${suffix}`));
  }

  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    const tab = request.nextUrl.searchParams.get("tab");
    if (tab && LEGACY_TAB_PATHS[tab]) {
      return NextResponse.redirect(appUrl(request, LEGACY_TAB_PATHS[tab]));
    }
    if (
      pathname === "/settings/deploy" ||
      pathname === "/settings/organization"
    ) {
      return NextResponse.redirect(appUrl(request, "/settings/profile"));
    }
  }

  const gated = platformSessionMiddleware(request, {
    appOrigin,
    protectedPrefixes: ["/settings"],
  });
  if (gated) {
    setPrivateNoStore(gated.headers);
    return gated;
  }
  const response = NextResponse.next();
  if (pathname === "/settings" || pathname.startsWith("/settings/")) {
    setPrivateNoStore(response.headers);
  }
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ["/settings/:path*", "/account/:path*"],
};
