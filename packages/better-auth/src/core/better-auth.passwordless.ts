import { MagicLinkEmail, sendEmail } from "@loftlancer/resend";
import { env } from "@loftlancer/t3-env/server";
import type { BetterAuthOptions } from "better-auth";
import { magicLink } from "better-auth/plugins/magic-link";

/**
 * Passwordless sign-in only (#373): GitHub, Google (#359) and email magic
 * links. Email + password is disabled on every Better Auth instance.
 */

const e2eTestMode = process.env.E2E_TEST_MODE === "1";
export const MAGIC_LINK_EXPIRES_IN_SECONDS = 10 * 60;

export const passwordDisabled = {
  emailAndPassword: { enabled: false },
} satisfies Pick<BetterAuthOptions, "emailAndPassword">;

/** Google is offered only when both credentials exist. */
export function isGoogleSignInConfigured(): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function socialProviders(): NonNullable<
  BetterAuthOptions["socialProviders"]
> {
  return {
    github: {
      clientId: env.GITHUB_CLIENT_ID ?? "build-placeholder",
      clientSecret: env.GITHUB_CLIENT_SECRET ?? "build-placeholder",
    },
    ...(isGoogleSignInConfigured()
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
            prompt: "select_account" as const,
          },
        }
      : {}),
  };
}

/*
 * Account linking stays on Better Auth's safe defaults: a Google or GitHub
 * sign-in links to an existing user with the same email only when the
 * provider marks that email verified and the local user is verified too.
 * No `trustedProviders`, because that would skip the verified-email check.
 */

// --- E2E (local only): capture the link instead of emailing it -------------

type E2eStore = { __llE2eMagicLinks?: Map<string, string> };

function e2eStore(): Map<string, string> {
  const g = globalThis as E2eStore;
  g.__llE2eMagicLinks ??= new Map();
  return g.__llE2eMagicLinks;
}

/** Pops the last captured magic-link token for an email (E2E mode only). */
export function takeE2eMagicLinkToken(email: string): string | undefined {
  const store = e2eStore();
  const token = store.get(email.toLowerCase());
  store.delete(email.toLowerCase());
  return token;
}

/** The magicLink plugin, sending through the shared Resend sender. */
export function magicLinkPlugin() {
  return magicLink({
    expiresIn: MAGIC_LINK_EXPIRES_IN_SECONDS,
    storeToken: "hashed",
    sendMagicLink: async ({ email, url, token }) => {
      if (e2eTestMode) {
        e2eStore().set(email.toLowerCase(), token);
        return;
      }
      const result = await sendEmail({
        to: email,
        subject: "Your Loftlancer sign-in link",
        react: MagicLinkEmail({
          url,
          expiresInMinutes: MAGIC_LINK_EXPIRES_IN_SECONDS / 60,
        }),
        tags: [{ name: "category", value: "magic-link" }],
        context: {
          category: "personal",
          templateKey: "magic-link",
        },
      });
      if (result.status !== "sent") {
        // Surface as an error so the UI shows "couldn't send" instead of "sent".
        throw new Error(
          result.status === "skipped"
            ? "Email sign-in is not configured"
            : "Could not send the sign-in email",
        );
      }
    },
  });
}

/** Instances that only need magic links for the local e2e login. */
export function e2eMagicLinkPlugins() {
  return e2eTestMode ? [magicLinkPlugin()] : [];
}

type MagicLinkApi = {
  signInMagicLink: (input: {
    body: { email: string; name?: string; callbackURL?: string };
    headers: Headers;
  }) => Promise<unknown>;
  magicLinkVerify: (input: {
    query: { token: string; callbackURL?: string };
    headers: Headers;
    asResponse: true;
  }) => Promise<Response>;
};

/**
 * Local e2e login without a password (E2E_TEST_MODE only): request a magic
 * link, take the captured token and verify it. Returns a JSON 200 carrying
 * the session cookies, like the old email sign-in response did.
 */
export async function e2ePasswordlessSignIn(
  instance: { api: unknown },
  user: { email: string; name: string },
): Promise<Response> {
  if (!e2eTestMode) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const api = instance.api as MagicLinkApi;
  const headers = new Headers();
  await api.signInMagicLink({
    body: { email: user.email, name: user.name, callbackURL: "/" },
    headers,
  });
  const token = takeE2eMagicLinkToken(user.email);
  if (!token) {
    return Response.json({ error: "No magic link captured" }, { status: 500 });
  }
  const verified = await api.magicLinkVerify({
    query: { token, callbackURL: "/" },
    headers,
    asResponse: true,
  });
  const response = Response.json({ ok: true, email: user.email });
  for (const cookie of verified.headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
  return response;
}
