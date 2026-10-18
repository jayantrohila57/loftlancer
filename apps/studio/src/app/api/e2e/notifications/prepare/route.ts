import { auth } from "@loftlancer/auth";
import { resolveE2eRouteAccess } from "@loftlancer/auth/e2e-route-access";
import { e2ePasswordlessSignIn } from "@loftlancer/auth/passwordless";
import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { env } from "@loftlancer/env/server";
import { prepareE2eInvitationNotifications } from "@loftlancer/notifications/e2e/prepare-invitation";
import { NextResponse } from "next/server";
import { e2ePersonaCredentials } from "@/lib/e2e-users";

async function ensureE2eUsers() {
  for (const persona of ["primary", "invitee"] as const) {
    const credentials = e2ePersonaCredentials(persona);
    // Passwordless (#373): verifying a captured magic link creates the user.
    await e2ePasswordlessSignIn(auth, {
      email: credentials.email,
      name: credentials.name,
    });
  }
}

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
  if (!isOrganizationsEnabled()) {
    return NextResponse.json(
      { error: "ORGANIZATIONS_ENABLED must be true" },
      { status: 412 },
    );
  }

  await ensureE2eUsers();
  const result = await prepareE2eInvitationNotifications();
  return NextResponse.json(result);
}
