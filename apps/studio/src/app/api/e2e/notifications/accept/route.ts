import { auth } from "@loftlancer/auth";
import { resolveE2eRouteAccess } from "@loftlancer/auth/e2e-route-access";
import { e2ePasswordlessSignIn } from "@loftlancer/auth/passwordless";
import { env } from "@loftlancer/env/server";
import { resolveAuthServiceUrl } from "@loftlancer/env/vercel-services";
import { NextResponse } from "next/server";
import { e2ePersonaCredentials } from "@/lib/e2e-users";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const access = resolveE2eRouteAccess(request);
  if (access === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (access === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (env.NOTIFICATIONS_ENABLED !== "true") {
    return NextResponse.json(
      { error: "NOTIFICATIONS_ENABLED must be true" },
      { status: 412 },
    );
  }

  const body = (await request.json()) as { invitationId?: string };
  if (!body.invitationId?.trim()) {
    return NextResponse.json(
      { error: "invitationId required" },
      { status: 400 },
    );
  }

  const invitee = e2ePersonaCredentials("invitee");
  const signIn = await e2ePasswordlessSignIn(auth, {
    email: invitee.email,
    name: invitee.name,
  });

  if (!signIn.ok) {
    return NextResponse.json(
      { error: "Invitee sign-in failed" },
      { status: 500 },
    );
  }

  const cookie = signIn.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  const baseUrl = (env.BETTER_AUTH_URL || resolveAuthServiceUrl()).replace(
    /\/$/,
    "",
  );
  const accept = await fetch(
    `${baseUrl}/api/auth/organization/accept-invitation`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: baseUrl,
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({ invitationId: body.invitationId }),
    },
  );

  if (!accept.ok) {
    const text = await accept.text();
    return NextResponse.json(
      { error: "Accept failed", detail: text },
      { status: 500 },
    );
  }

  const { notifyInvitationAccepted } = await import(
    "@loftlancer/notifications"
  );
  await notifyInvitationAccepted(body.invitationId);

  return NextResponse.json({ ok: true });
}
