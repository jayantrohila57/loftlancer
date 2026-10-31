import { validateReturnTo } from "@loftlancer/auth/return-to";
import { landingUrl, studioHomeUrl } from "@loftlancer/ui/auth-links";
import { type NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/base-path";
import { platformAuth } from "@/lib/platform-auth";

const PROVIDERS = new Set(["github", "google"]);

function googleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() &&
      process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

/**
 * Start GitHub or Google sign-in straight from a link (#302, #359): no
 * sign-in screen. Lands on /studio (org list). `return_to` is honoured only
 * for the auth app's own device/consent flows; validateReturnTo allowlists it.
 * Google answers only when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET exist.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const home = new URL("/", request.nextUrl.origin);
  const requestedErrorPath = request.nextUrl.searchParams.get("error_path");
  const errorPath =
    requestedErrorPath?.startsWith("/") &&
    !requestedErrorPath.startsWith("//") &&
    !requestedErrorPath.includes("\\")
      ? requestedErrorPath
      : "/";
  const errorUrl = new URL(errorPath, requestedErrorPath ? landingUrl() : home);
  if (
    !PROVIDERS.has(provider) ||
    (provider === "google" && !googleConfigured())
  ) {
    return NextResponse.redirect(home);
  }
  errorUrl.searchParams.set("auth_error", "oauth");

  const returnTo = validateReturnTo(
    request.nextUrl.searchParams.get("return_to"),
    { fallback: studioHomeUrl() },
  );
  const finish = appUrl(request, "/api/auth/cross-app/finish");
  finish.searchParams.set("return_to", returnTo);

  const result = await platformAuth.api.signInSocial({
    body: {
      provider: provider as "github" | "google",
      callbackURL: finish.toString(),
      errorCallbackURL: errorUrl.toString(),
    },
    headers: request.headers,
    asResponse: true,
  });
  const data = (await result
    .clone()
    .json()
    .catch(() => null)) as { url?: string } | null;
  if (!result.ok || !data?.url) {
    return NextResponse.redirect(errorUrl);
  }
  const response = NextResponse.redirect(data.url);
  for (const cookie of result.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}
