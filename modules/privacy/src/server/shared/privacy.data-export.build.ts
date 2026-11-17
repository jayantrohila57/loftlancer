import { getDb } from "@packages/drizzle"
import {
  account,
  activityEvent,
  member,
  organization,
  session,
  studioOnboardingProgress,
  user,
  userNotificationPreference,
  userPrivacyConsent,
} from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"

export async function buildPrivacyUserDataExport(userId: string) {
  const db = getDb()
  if (!db) throw new Error("Database unavailable")

  const [profile] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  const accounts = await db
    .select({
      id: account.id,
      providerId: account.providerId,
      accountId: account.accountId,
      scope: account.scope,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    })
    .from(account)
    .where(eq(account.userId, userId))

  const sessions = await db
    .select({
      id: session.id,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      activeOrganizationId: session.activeOrganizationId,
    })
    .from(session)
    .where(eq(session.userId, userId))

  const memberships = await db
    .select({
      id: member.id,
      organizationId: member.organizationId,
      role: member.role,
      createdAt: member.createdAt,
      organizationName: organization.name,
      organizationSlug: organization.slug,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId))

  const authoredActivity = await db
    .select({
      activityId: activityEvent.activityId,
      actionId: activityEvent.actionId,
      sourceApp: activityEvent.sourceApp,
      sourceModule: activityEvent.sourceModule,
      outcome: activityEvent.outcome,
      occurredAt: activityEvent.occurredAt,
      metadata: activityEvent.metadata,
    })
    .from(activityEvent)
    .where(eq(activityEvent.actorUserId, userId))

  const [notificationPrefs] = await db
    .select()
    .from(userNotificationPreference)
    .where(eq(userNotificationPreference.userId, userId))
    .limit(1)

  const [privacyConsents] = await db
    .select()
    .from(userPrivacyConsent)
    .where(eq(userPrivacyConsent.userId, userId))
    .limit(1)

  const [onboardingProgress] = await db
    .select()
    .from(studioOnboardingProgress)
    .where(eq(studioOnboardingProgress.userId, userId))
    .limit(1)

  return {
    exportedAt: new Date().toISOString(),
    profile: profile ?? null,
    accounts,
    sessions,
    memberships,
    orgActivityAuthoredByUser: authoredActivity,
    notificationPreferences: notificationPrefs ?? null,
    privacyConsents: privacyConsents ?? null,
    studioOnboardingProgress: onboardingProgress ?? null,
  }
}
