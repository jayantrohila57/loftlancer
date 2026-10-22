import { platformSessionMiddleware } from "@loftlancer/auth/platform-middleware";
import { DEFAULT_STUDIO_URL } from "@loftlancer/env/platform";
import { resolvePublicServiceUrl } from "@loftlancer/env/vercel-services";
import { isReservedOrgSlug } from "@loftlancer/ui/studio-routes";
import { type NextRequest, NextResponse } from "next/server";
import { isPublicInvitationRoute } from "@/lib/public-invitation-route";
import { siblingAuth } from "@/lib/sibling-auth";

const appOrigin = (
  process.env.NEXT_PUBLIC_STUDIO_URL ??
  (process.env.VERCEL_SERVICES === "1"
    ? resolvePublicServiceUrl("studio")
    : DEFAULT_STUDIO_URL)
).replace(/\/$/, "");

/**
 * Continue to the page with `x-pathname` on the REQUEST, so server layouts
 * can read it via headers() (page guards, the org layout preflight, #306).
 */
function nextWithPathname(request: NextRequest): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  requestHeaders.set("x-search", request.nextUrl.search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

/**
 * The URL org is the source of truth (#299). Before rendering /[org]/…, make
 * the session's active org match it, so tRPC and server guards read the same
 * org. Cheap: getSession hits the cookie cache; setActive only runs on a
 * mismatch (one extra hop, then the same URL again).
 */
async function syncActiveOrganization(
  request: NextRequest,
  orgSlug: string,
): Promise<NextResponse | undefined> {
  const session = await siblingAuth.api
    .getSession({ headers: request.headers })
    .catch(() => null);
  if (!session) return undefined;
  const activeId = (session.session as { activeOrganizationId?: string | null })
    .activeOrganizationId;
  const synced = request.cookies.get("ll_org")?.value;
  if (activeId && synced === `${orgSlug}:${activeId}`) return undefined;
  // Already redirected once for this org and the session still disagrees
  // (stale cookie cache): don't loop; page guards resolve by slug anyway.
  if (request.cookies.get("ll_org_sync")?.value === orgSlug) {
    const response = nextWithPathname(request);
    response.cookies.delete("ll_org_sync");
    return response;
  }

  const result = await siblingAuth.api
    .setActiveOrganization({
      headers: request.headers,
      body: { organizationSlug: orgSlug },
      asResponse: true,
    })
    .catch(() => null);
  // Not a member (or no such org): let the org layout render its 404.
  if (!result?.ok) return undefined;
  const body = (await result
    .clone()
    .json()
    .catch(() => null)) as {
    id?: string;
  } | null;
  if (body?.id && body.id === activeId) {
    const response = nextWithPathname(request);
    response.cookies.set("ll_org", `${orgSlug}:${body.id}`, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  }
  const response = NextResponse.redirect(request.nextUrl);
  for (const cookie of result.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  response.cookies.set("ll_org_sync", orgSlug, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 30,
    secure: request.nextUrl.protocol === "https:",
  });
  if (body?.id) {
    response.cookies.set("ll_org", `${orgSlug}:${body.id}`, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
    });
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Everything in studio needs a session; signed-out visitors go to the landing.
  const publicInvitation = isPublicInvitationRoute(pathname);
  const gated = publicInvitation
    ? undefined
    : platformSessionMiddleware(request, {
        appOrigin,
        protectedPrefixes: ["/"],
      });
  if (gated) {
    return gated;
  }

  const first = pathname.split("/")[1] ?? "";
  const isOrganizationsDirectory =
    pathname === "/organizations" &&
    first === "organizations" &&
    request.nextUrl.searchParams.get("directory") === "1";
  if (
    !publicInvitation &&
    first &&
    !isReservedOrgSlug(first) &&
    !isOrganizationsDirectory
  ) {
    const synced = await syncActiveOrganization(request, first);
    if (synced) return synced;
  }

  return nextWithPathname(request);
}

export const config = {
  // All pages; not API routes, Next internals or static files.
  matcher: ["/((?!api/|_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
