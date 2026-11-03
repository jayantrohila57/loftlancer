import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { setRequestCookie, setSessionCookie } from "better-auth/cookies";
import {
  findLegacySessionCookie,
  getLoftlancerSessionToken,
  type LegacySessionCookieHit,
  legacySessionCookieNamesToExpire,
} from "./better-auth.session-cookies";

const MIGRATION_CONTEXT_KEY = "legacySessionCookieMigration";

type MigrationContext = {
  [MIGRATION_CONTEXT_KEY]?: LegacySessionCookieHit;
};

function readMigration(ctx: {
  context: MigrationContext;
}): LegacySessionCookieHit | undefined {
  return ctx.context[MIGRATION_CONTEXT_KEY];
}

/**
 * Accepts legacy Better Auth session cookies and re-issues `loftlancer.*` cookies
 * on the next successful session response.
 */
export function sessionCookieMigrationPlugin(): BetterAuthPlugin {
  return {
    id: "loftlancer-session-cookie-migration",
    hooks: {
      before: [
        {
          matcher: () => true,
          handler: createAuthMiddleware(async (ctx) => {
            const sourceHeaders = ctx.request?.headers ?? ctx.headers;
            if (!sourceHeaders) {
              return;
            }
            if (getLoftlancerSessionToken(sourceHeaders)) {
              return;
            }
            const legacy = findLegacySessionCookie(sourceHeaders);
            if (!legacy) {
              return;
            }
            const headers = new Headers(
              Object.fromEntries(sourceHeaders.entries()),
            );
            setRequestCookie(
              headers,
              ctx.context.authCookies.sessionToken.name,
              legacy.rawValue,
            );
            return {
              context: {
                headers,
                [MIGRATION_CONTEXT_KEY]: legacy,
              },
            };
          }),
        },
      ],
      after: [
        {
          matcher: () => true,
          handler: createAuthMiddleware(async (ctx) => {
            const legacy = readMigration(ctx);
            if (!legacy) {
              return;
            }
            const session = ctx.context.session ?? ctx.context.newSession;
            if (!session?.session || !session.user) {
              return;
            }
            await setSessionCookie(ctx, session);
            for (const name of legacySessionCookieNamesToExpire(
              legacy.prefix,
            )) {
              ctx.setCookie(name, "", {
                path: "/",
                maxAge: 0,
              });
            }
          }),
        },
      ],
    },
  };
}
