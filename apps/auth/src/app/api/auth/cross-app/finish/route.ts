import { appendOttToUrl, isCrossOriginReturnTo } from "@loftlancer/better-auth";
import { validateReturnTo } from "@loftlancer/better-auth/return-to";
import { env } from "@loftlancer/t3-env/server";
import {
  resolveAuthPublicUrl,
  resolveAuthServiceUrl,
} from "@loftlancer/t3-env/vercel-services";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { platformAuth } from "@/lib/platform-auth";

/**
 * After GitHub OAuth on the auth app, mint a one-time token for sibling-app cookies.
 */
export async function GET(request: NextRequest) {
  const returnTo = validateReturnTo(
    request.nextUrl.searchParams.get("return_to"),
  );
  const headerList = await headers();
  const session = await platformAuth.api.getSession({ headers: headerList });

  if (!session) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  const authPublicOrigin = env.BETTER_AUTH_URL ?? resolveAuthPublicUrl();
  if (!isCrossOriginReturnTo(returnTo, authPublicOrigin)) {
    return NextResponse.redirect(returnTo);
  }

  const authService = resolveAuthServiceUrl();
  const tokenUrl = new URL(
    `${authService.replace(/\/$/, "")}/api/auth/one-time-token/generate`,
  );
  const tokenResponse = await fetch(tokenUrl, {
    headers: {
      cookie: headerList.get("cookie") ?? "",
    },
  });
  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }
  const { token } = (await tokenResponse.json()) as { token: string };

  return NextResponse.redirect(appendOttToUrl(returnTo, token));
}
