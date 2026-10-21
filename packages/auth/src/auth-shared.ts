import { orgAc, orgBetterAuthRoles } from "@loftlancer/actions";
import { activeUserWhere, db } from "@loftlancer/db";
import { assertOrganizationCanBeDeleted } from "@loftlancer/db/org-delete-policy";
import * as authSchema from "@loftlancer/db/schema/auth";
import { user } from "@loftlancer/db/schema/auth";
import { deviceCode } from "@loftlancer/db/schema/device-code";
import { jwks } from "@loftlancer/db/schema/jwks";
import * as oauthSchema from "@loftlancer/db/schema/oauth";
import * as organizationSchema from "@loftlancer/db/schema/organization";
import * as teamSchema from "@loftlancer/db/schema/team";
import { teamMember } from "@loftlancer/db/schema/team";
import { isOrganizationsEnabled } from "@loftlancer/env/organizations";
import { isReservedOrgSlug } from "@loftlancer/env/reserved-slugs";
import {
  isNotificationsEnabled,
  linkPendingNotificationsForUser,
} from "@loftlancer/notifications";
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { admin } from "better-auth/plugins/admin";
import { eq } from "drizzle-orm";
import { writeAuthAuditEvent } from "./audit-event";
import { resolveDefaultActiveOrganizationId } from "./bootstrap-active-organization";
import { sendOrganizationInvitationEmail } from "./organization-invitation-email";
import { cleanupOrganizationMemberAccess } from "./organization-member-removal";
import { sessionCookieMigrationPlugin } from "./session-cookie-migration-plugin";
import { LOFTLANCER_COOKIE_PREFIX } from "./session-cookies";

export function sharedDatabaseHooks(): BetterAuthOptions["databaseHooks"] {
  return {
    session: {
      create: {
        before: async (session) => {
          if (!isOrganizationsEnabled() || session.activeOrganizationId) {
            return;
          }
          const organizationId = await resolveDefaultActiveOrganizationId(
            session.userId,
          );
          if (!organizationId) {
            return;
          }
          return {
            data: {
              activeOrganizationId: organizationId,
            },
          };
        },
        after: async (session) => {
          void writeAuthAuditEvent({
            action: "session.sign_in",
            result: "success",
            actorUserId: session.userId,
            entityId: session.id,
            payload: { sessionId: session.id },
          });

          if (!isNotificationsEnabled()) {
            return;
          }
          void (async () => {
            const [record] = await db
              .select({ email: user.email })
              .from(user)
              .where(activeUserWhere(eq(user.id, session.userId)))
              .limit(1);
            if (record?.email) {
              await linkPendingNotificationsForUser(
                session.userId,
                record.email,
              );
            }
          })();
        },
      },
      delete: {
        after: async (session) => {
          await writeAuthAuditEvent({
            action: "session.sign_out",
            result: "success",
            actorUserId: session.userId,
            entityId: session.id,
            payload: { sessionId: session.id },
          });
        },
      },
    },
  };
}

export function sharedSessionConfig(): BetterAuthOptions["session"] {
  return {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  };
}

export function sharedAuthAdvanced(): NonNullable<
  BetterAuthOptions["advanced"]
> {
  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim() ?? "";
  const useCrossSubdomain =
    process.env.AUTH_CROSS_SUBDOMAIN_COOKIES === "true" &&
    cookieDomain.length > 0 &&
    !cookieDomain.includes("localhost");

  return {
    cookiePrefix: LOFTLANCER_COOKIE_PREFIX,
    ...(useCrossSubdomain
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: cookieDomain,
          },
        }
      : {}),
  };
}

export function sharedDatabaseConfig(): BetterAuthOptions["database"] {
  return drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...authSchema,
      ...organizationSchema,
      ...teamSchema,
    },
  });
}

/** OAuth/MCP tables for `apps/auth` when `PLATFORM_AUTH_ENABLE_MCP=1`. */
export function platformDatabaseConfig(): BetterAuthOptions["database"] {
  const base = {
    ...authSchema,
    ...organizationSchema,
    ...teamSchema,
    jwks,
    deviceCode,
  };
  if (process.env.PLATFORM_AUTH_ENABLE_MCP !== "1") {
    return drizzleAdapter(db, { provider: "pg", schema: base });
  }
  return drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...base,
      ...oauthSchema,
    },
  });
}

function assertOrgSlugAllowed(slug: string | undefined) {
  if (slug && isReservedOrgSlug(slug)) {
    throw new APIError("BAD_REQUEST", {
      message: `"${slug}" is reserved. Choose a different slug.`,
    });
  }
}

async function assertOrganizationNotArchived(organizationId: string) {
  const [row] = await db
    .select({ archivedAt: organizationSchema.organization.archivedAt })
    .from(organizationSchema.organization)
    .where(eq(organizationSchema.organization.id, organizationId))
    .limit(1);
  if (row?.archivedAt) {
    throw new APIError("FORBIDDEN", {
      message:
        "This organization is archived. Restore it before making changes.",
    });
  }
}

function assertOrganizationLogoUrl(logo: unknown) {
  if (logo === undefined || logo === null) return;
  let parsed: URL;
  try {
    if (typeof logo !== "string" || logo.length > 2048) throw new Error();
    parsed = new URL(logo);
  } catch {
    throw new APIError("BAD_REQUEST", {
      message: "Use a valid HTTP or HTTPS organization logo URL.",
    });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new APIError("BAD_REQUEST", {
      message: "Use a valid HTTP or HTTPS organization logo URL.",
    });
  }
}

export function organizationPlugin() {
  if (!isOrganizationsEnabled()) {
    return [];
  }
  return [
    organization({
      allowUserToCreateOrganization: true,
      ac: orgAc,
      roles: orgBetterAuthRoles,
      teams: { enabled: true },
      // Shared with MCP invitations so both paths deliver identical response links.
      sendInvitationEmail: async ({
        id,
        email,
        role,
        organization: org,
        inviter,
      }) => {
        await sendOrganizationInvitationEmail({
          invitationId: id,
          email,
          role,
          organizationName: org.name,
          inviterName: inviter.user.name || inviter.user.email,
        });
      },
      organizationHooks: {
        beforeAcceptInvitation: async ({ invitation: invite }) => {
          await assertOrganizationNotArchived(invite.organizationId);
          const [scope] = await db
            .select({
              projectId: organizationSchema.invitation.projectId,
              teamId: organizationSchema.invitation.teamId,
            })
            .from(organizationSchema.invitation)
            .where(eq(organizationSchema.invitation.id, invite.id))
            .limit(1);
          if (scope?.projectId || scope?.teamId) {
            throw new APIError("BAD_REQUEST", {
              message:
                "Accept this scoped invitation from its Loftlancer invitation page.",
            });
          }
        },
        // Org slugs are the first URL segment (#299); never shadow a route.
        beforeCreateOrganization: async ({ organization: org }) => {
          assertOrgSlugAllowed(org.slug);
        },
        beforeUpdateOrganization: async ({ organization: updates, member }) => {
          await assertOrganizationNotArchived(member.organizationId);
          assertOrganizationLogoUrl(updates.logo);
          if (typeof updates.slug === "string") {
            assertOrgSlugAllowed(updates.slug);
          }
        },
        beforeAddMember: async ({ member: membership }) => {
          await assertOrganizationNotArchived(membership.organizationId);
        },
        beforeRemoveMember: async ({ member: membership }) => {
          await assertOrganizationNotArchived(membership.organizationId);
        },
        beforeUpdateMemberRole: async ({ member: membership }) => {
          await assertOrganizationNotArchived(membership.organizationId);
        },
        beforeCreateInvitation: async ({ invitation: invite }) => {
          await assertOrganizationNotArchived(invite.organizationId);
        },
        beforeCreateTeam: async ({ team }) => {
          await assertOrganizationNotArchived(team.organizationId);
        },
        beforeUpdateTeam: async ({ organization: org }) => {
          await assertOrganizationNotArchived(org.id);
        },
        beforeDeleteTeam: async ({ organization: org }) => {
          await assertOrganizationNotArchived(org.id);
        },
        beforeAddTeamMember: async ({ organization: org }) => {
          await assertOrganizationNotArchived(org.id);
        },
        beforeRemoveTeamMember: async ({ organization: org }) => {
          await assertOrganizationNotArchived(org.id);
        },
        beforeDeleteOrganization: async ({ organization: org, user }) => {
          await assertOrganizationCanBeDeleted(org, user.id);
        },
        afterCreateOrganization: async ({ organization: org, user }) => {
          await db
            .update(organizationSchema.organization)
            .set({
              createdBy: user.id,
              updatedBy: user.id,
              updatedAt: new Date(),
            })
            .where(eq(organizationSchema.organization.id, org.id));
          await writeAuthAuditEvent({
            action: "organization.create",
            result: "success",
            actorUserId: user.id,
            organizationId: org.id,
            entityId: org.id,
            entitySlug: org.slug,
            payload: { name: org.name },
          });
        },
        afterUpdateOrganization: async ({ organization: org, user }) => {
          if (!org) return;
          await db
            .update(organizationSchema.organization)
            .set({ updatedBy: user.id, updatedAt: new Date() })
            .where(eq(organizationSchema.organization.id, org.id));
          await writeAuthAuditEvent({
            action: "organization.update",
            result: "success",
            actorUserId: user.id,
            organizationId: org.id,
            entityId: org.id,
            entitySlug: org.slug,
          });
        },
        afterCreateInvitation: async ({ invitation: invite, inviter }) => {
          await writeAuthAuditEvent({
            action: "member.invite",
            result: "success",
            actorUserId: inviter.id,
            organizationId: invite.organizationId,
            entityId: invite.id,
            payload: {
              invitationId: invite.id,
              email: invite.email,
            },
          });
        },
        afterAcceptInvitation: async ({ invitation: invite, user }) => {
          await writeAuthAuditEvent({
            action: "invitation.accept",
            result: "success",
            actorUserId: user.id,
            organizationId: invite.organizationId,
            entityId: invite.id,
            payload: { invitationId: invite.id },
          });
        },
        afterCancelInvitation: async ({ invitation: invite, cancelledBy }) => {
          await writeAuthAuditEvent({
            action: "invitation.cancel",
            result: "success",
            actorUserId: cancelledBy.id,
            organizationId: invite.organizationId,
            entityId: invite.id,
            payload: { invitationId: invite.id },
          });
        },
        afterUpdateMemberRole: async ({
          member: memberRow,
          user,
          organization: org,
        }) => {
          if (!org) return;
          await writeAuthAuditEvent({
            action: "member.role.update",
            result: "success",
            actorUserId: user.id,
            organizationId: org.id,
            entityId: memberRow.id,
            targetUserId: memberRow.userId,
            payload: { role: memberRow.role },
          });
        },
        afterRemoveMember: async ({
          member: memberRow,
          user,
          organization: org,
        }) => {
          if (!org) return;
          await cleanupOrganizationMemberAccess({
            organizationId: org.id,
            userId: memberRow.userId,
          });
          await writeAuthAuditEvent({
            action: "member.remove",
            result: "success",
            actorUserId: user.id,
            organizationId: org.id,
            entityId: memberRow.id,
            targetUserId: memberRow.userId,
          });
        },
        afterCreateTeam: async ({ team, user }) => {
          if (!user?.id) return;
          // Better Auth already adds the creator to the default team when it
          // creates an organization; a plain insert hit team_member_team_user_uidx
          // and turned organization/create into a 500 after the org was saved.
          await db
            .insert(teamMember)
            .values({
              id: crypto.randomUUID(),
              teamId: team.id,
              userId: user.id,
            })
            .onConflictDoNothing();
        },
      },
    }),
  ];
}

/** Auth plugins excluding Next.js cookie forwarding — append `withNextCookies()` last. */
export function coreAuthPlugins() {
  return [
    sessionCookieMigrationPlugin(),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    ...organizationPlugin(),
  ];
}

export function withNextCookies<T extends readonly unknown[]>(
  plugins: T,
): [...T, ReturnType<typeof nextCookies>] {
  return [...plugins, nextCookies()];
}

/** @deprecated Prefer `withNextCookies(coreAuthPlugins())` so cookies run last. */
export function basePlugins() {
  return withNextCookies(coreAuthPlugins());
}
