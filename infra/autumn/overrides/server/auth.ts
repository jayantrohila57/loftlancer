import "dotenv/config";
import { allowLoftlancerIdentity } from "./loftlancer-identity.mjs";

import { invitation } from "@autumn/shared";
import { getScopesForUserInOrg } from "@autumn/shared/utils/auth/getScopesForUserInOrg";
import { betterAuth, type User } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
	admin,
	customSession,
	genericOAuth,
	type Organization,
	organization,
} from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "@/db/initDrizzle.js";
import { logger } from "@/external/logtail/logtailUtils.js";
import { createLoopsContact } from "@/external/resend/loopsUtils.js";
import { sendInvitationEmail } from "@/internal/emails/sendInvitationEmail.js";
import { sendOnboardingEmail } from "@/internal/emails/sendOnboardingEmail.js";
import { getSsoProviderIdFromCallbackPath } from "@/internal/auth/sso/ssoInvitationProvisioning.js";
import { afterOrgCreated } from "./authUtils/afterOrgCreated.js";
import { beforeSessionCreated } from "./authUtils/beforeSessionCreated.js";
import { ADMIN_USER_IDs } from "./constants.js";

const configuredAuthBaseUrl = process.env.BETTER_AUTH_URL?.trim() || undefined;
export const authBaseUrl =
	configuredAuthBaseUrl ??
	(process.env.NODE_ENV === "production" ? undefined : "http://localhost:4002");

export const auth = betterAuth({
	advanced: { cookiePrefix: "loftlancer-autumn" },
	baseURL: process.env.BETTER_AUTH_URL,
	telemetry: {
		enabled: false,
	},

	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
	}),

	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await createLoopsContact(user);
					await sendOnboardingEmail({
						name: user.name,
						email: user.email,
					});
				},
			},
		},
		session: {
			create: {
				before: async (session, context) => {
					const providerId = getSsoProviderIdFromCallbackPath(
						context?.path,
						context?.params as Record<string, unknown> | undefined,
					);
					// Loftlancer is a local, single-identity provider, not an Autumn
					// enterprise SSO connection. Its verified allowlist is enforced in
					// getUserInfo below; retain the normal membership/default-org path.
					return beforeSessionCreated(
						session,
						providerId === "loftlancer" ? null : context,
					);
				},
			},
		},
	},
	user: {
		deleteUser: {
			enabled: true,

			sendDeleteAccountVerification: async ({ user, url, token }) => {
				console.log("Delete account verification", { url, token });
			},
		},
	},
	trustedOrigins: (() => {
		const origins = [
			"http://localhost:4001",
			"https://app.useautumn.com",
			"https://staging.useautumn.com",
			"https://*.useautumn.com",
		];

		// Loftlancer web apps (3001–3004) + infra dashboards (4001–4004)
		if (process.env.NODE_ENV === "development") {
			for (let port = 3001; port <= 3004; port++) {
				origins.push(`http://localhost:${port}`);
			}
			for (let port = 4001; port <= 4004; port++) {
				origins.push(`http://localhost:${port}`);
			}
		}

		return origins;
	})(),
	emailAndPassword: { enabled: false },
	plugins: [
		genericOAuth({ config: [{
			providerId: "loftlancer",
			clientId: process.env.LOFTLANCER_OIDC_CLIENT_ID!,
			clientSecret: process.env.LOFTLANCER_OIDC_CLIENT_SECRET!,
			authorizationUrl: "http://localhost:3002/auth/api/auth/oauth2/authorize",
			tokenUrl: "http://host.docker.internal:3002/auth/api/auth/oauth2/token",
			scopes: ["openid", "profile", "email"],
			pkce: true,
			async getUserInfo(tokens) {
				if (!tokens.accessToken) return null;
				const response = await fetch("http://host.docker.internal:3002/auth/api/auth/oauth2/userinfo", { headers: { Authorization: `Bearer ${tokens.accessToken}` } });
				if (!response.ok) return null;
				const profile = await response.json() as { sub?: string; name?: string; email?: string; email_verified?: boolean };
				return allowLoftlancerIdentity(profile);
			},
		}] }),
		admin({
			adminUserIds: ADMIN_USER_IDs,
			impersonationSessionDuration: 1000 * 60 * 60 * 24, // 1 days
		}),

		organization({
			async sendInvitationEmail(data: {
				id: string;
				email: string;
				organization: Organization;
			}) {
				const inviteLink = `${process.env.CLIENT_URL}/accept?id=${data.id}`;
				await sendInvitationEmail({
					email: data.email,
					orgName: data.organization.name,
					inviteLink,
				});

				try {
					// Update invite to expire in 7 days
					await db
						.update(invitation)
						.set({
							expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
						})
						.where(eq(invitation.id, data.id));
				} catch (error) {
					logger.error("Error updating invite expiration date:", { error });
				}
			},
			schema: {
				organization: {
					modelName: "organizations",
					fields: {
						createdAt: "createdAt",
					},
				},
			},

			organizationCreation: {
				disabled: false,
				afterCreate: async ({
					organization,
					user,
				}: {
					organization: Organization;
					user: User;
				}) => {
					await afterOrgCreated({ org: organization, user });
				},
			},
		}),
		customSession(async ({ user, session }) => {
			const orgId = session.activeOrganizationId;
			const resolved = orgId && user?.id
				? await getScopesForUserInOrg({ db, userId: user.id, organizationId: orgId })
				: null;
			const scopes = resolved ? [...resolved.scopes] : [];
			if ((user as { role?: string }).role === "admin" || (session as { impersonatedBy?: string | null }).impersonatedBy) {
				if (!scopes.includes("superuser")) scopes.push("superuser");
			}
			return { user, session, role: resolved?.role ?? null, scopes };
		}),
	],
});
