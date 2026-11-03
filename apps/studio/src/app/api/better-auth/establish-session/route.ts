import { type NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/base-path";
import { siblingAuth } from "@/lib/sibling-auth";

import { routes } from "@/utils/navigation";

export async function GET(request: NextRequest) {
  const ott = request.nextUrl.searchParams.get("ott");
  const nextPath =
    request.nextUrl.searchParams.get("next")?.trim() || routes.home();

  if (!ott) {
    return NextResponse.redirect(appUrl(request, routes.home()));
  }

  const verifyResponse = await siblingAuth.api.verifyOneTimeToken({
    body: { token: ott },
    headers: request.headers,
    asResponse: true,
  });

  const redirect = NextResponse.redirect(appUrl(request, nextPath));
  for (const cookie of verifyResponse.headers.getSetCookie()) {
    redirect.headers.append("Set-Cookie", cookie);
  }
  return redirect;
}
