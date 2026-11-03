import "@features/authentication/core/server/authentication.register-better-auth-product-hooks";
import { prepareE2eInvitationNotifications } from "@features/notifications/core/server/notifications.e2e-prepare";
import { auth } from "@loftlancer/better-auth";
import { resolveE2eRouteAccess } from "@loftlancer/better-auth/e2e-route-access";
import { e2ePasswordlessSignIn } from "@loftlancer/better-auth/passwordless";
import { isOrganizationsEnabled } from "@loftlancer/t3-env/organizations";
import { env } from "@loftlancer/t3-env/server";
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
