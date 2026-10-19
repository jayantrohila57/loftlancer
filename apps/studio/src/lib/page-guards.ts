import "server-only";

import type { ActionName } from "@loftlancer/actions";
import {
  assertOrganizationTeamForPage,
  assertProjectEnvironmentForPage,
  assertProjectTaskForPage,
  organizationChildAction,
  requirePageAction,
  resolveOrganizationForPage,
  resolveProjectForPage,
  runPageGuard,
} from "@loftlancer/api/page-guards";
import type { RequirePageSessionResult } from "@loftlancer/auth/guards";
import { requirePageSession } from "@loftlancer/auth/guards";
import {
  type AuthSession,
  getSessionActiveOrganizationId,
} from "@loftlancer/auth/session-types";
import { DEFAULT_STUDIO_URL } from "@loftlancer/env/platform";
import {
  isReservedOrgSlug,
  isReservedProjectSlug,
} from "@loftlancer/ui/studio-routes";
import type { Route } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { planOrgSubtree } from "@/lib/org-route-preflight";
import { getServerSession } from "@/lib/server-auth";

const appOrigin = (
  process.env.NEXT_PUBLIC_STUDIO_URL ?? DEFAULT_STUDIO_URL
).replace(/\/$/, "");

async function currentReturnPath(): Promise<string> {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname");
  if (pathname?.startsWith("/")) {
    return pathname;
  }
  const nextUrl = headerList.get("x-url");
  if (nextUrl) {
    try {
      return new URL(nextUrl).pathname;
    } catch {
      /* ignore */
    }
  }
  return "/";
}

export async function guardAuthenticatedPage(): Promise<AuthSession> {
  const session = await getServerSession();
  const returnPath = await currentReturnPath();
  const result: RequirePageSessionResult = requirePageSession(session, {
    appOrigin,
    returnPath,
    mode: "platform",
  });
  if ("kind" in result && result.kind === "redirect") {
    redirect(result.url as Route);
  }
  if (!("ok" in result) || !result.ok) {
    redirect("/" as Route);
  }
  return result.session;
}

export async function guardPageAction(
  action: ActionName,
  partial: {
    organizationId?: string | null;
    projectId?: string | null;
    targetUserId?: string | null;
  } = {},
): Promise<AuthSession> {
  const session = await guardAuthenticatedPage();
  await runPageGuard(() =>
    requirePageAction(action, {
      userId: session.user.id,
      organizationId:
        partial.organizationId ?? getSessionActiveOrganizationId(session),
      projectId: partial.projectId ?? null,
      targetUserId: partial.targetUserId ?? null,
    }),
  );
  return session;
}

/** Cached per request: the [slug] layout and its page both call this. */
export const guardOrganizationSlugMembership = cache(async (slug: string) => {
  const session = await guardAuthenticatedPage();
  const org = await runPageGuard(() =>
    resolveOrganizationForPage(session.user.id, slug),
  );
  return { session, org };
});

export async function guardOrganizationSlugPage(
  slug: string,
  childSegment?: string,
) {
  const { session, org } = await guardOrganizationSlugMembership(slug);
  const action =
    (childSegment ? organizationChildAction(childSegment) : undefined) ??
    "organization.hub.view";
  await runPageGuard(() =>
    requirePageAction(action, {
      userId: session.user.id,
      organizationId: org.id,
    }),
  );
  return { session, org };
}

export async function loadProjectPageDataOrNotFound(
  slug: string,
): Promise<import("@/lib/project-page-loader").ProjectPageData> {
  await guardProjectSlugPage(slug);
  const { loadProjectPageData } = await import("@/lib/project-page-loader");
  const data = await loadProjectPageData(slug);
  if (!data) {
    const { notFound } = await import("next/navigation");
    return notFound();
  }
  return data;
}

export async function guardProjectEditPage(slug: string) {
  const { session, project } = await guardProjectSlugPage(slug);
  await runPageGuard(() =>
    requirePageAction("project.update", {
      userId: session.user.id,
      organizationId: getSessionActiveOrganizationId(session),
      projectId: project.id,
    }),
  );
  return project;
}

/** Cached per request so the org-layout preflight and the project layout share one lookup. */
export const guardProjectSlugPage = cache(async (slug: string) => {
  const session = await guardAuthenticatedPage();
  const organizationId = getSessionActiveOrganizationId(session);
  const projectRow = await runPageGuard(() =>
    resolveProjectForPage(session.user.id, slug, organizationId),
  );
  await runPageGuard(() =>
    requirePageAction("project.read", {
      userId: session.user.id,
      organizationId,
      projectId: projectRow.id,
    }),
  );
  return { session, project: projectRow };
});

/**
 * The org layout's loading.tsx streams everything below it, so a notFound()
 * in the project layout or any page under it would arrive after a 200 (#306,
 * #309). The org layout calls this first, before that boundary: it resolves
 * the whole request path (route shape, project, env / task) so every unknown
 * route under a real org or project is a real 404. The project lookup is the
 * same cached guard the project layout uses.
 */
export async function preflightOrgSubtree(orgSlug: string): Promise<void> {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const plan = planOrgSubtree(pathname, orgSlug);
  if (plan.kind === "org") return;
  if (plan.kind === "not-found") notFound();
  if (plan.kind === "team") {
    const { org } = await guardOrganizationSlugMembership(orgSlug);
    await runPageGuard(() =>
      assertOrganizationTeamForPage(org.id, plan.teamId),
    );
    return;
  }
  const { project } = await guardProjectSlugPage(plan.projectSlug);
  const resource = plan.resource;
  if (!resource) return;
  await runPageGuard(() =>
    resource.kind === "env"
      ? assertProjectEnvironmentForPage(project.id, resource.envSlug)
      : assertProjectTaskForPage(project.id, resource.number),
  );
}

export async function guardSupportManagerPage(): Promise<AuthSession> {
  const session = await guardAuthenticatedPage();
  const { requireSupportManagerPage } = await import(
    "@loftlancer/api/page-guards"
  );
  await runPageGuard(() => requireSupportManagerPage(session.user.id));
  return session;
}

export async function guardSupportTicketPage(
  ticketId: string,
): Promise<AuthSession> {
  const session = await guardAuthenticatedPage();
  const { requireSupportTicketPage } = await import(
    "@loftlancer/api/page-guards"
  );
  await runPageGuard(() => requireSupportTicketPage(session.user.id, ticketId));
  return session;
}

/** What a studio 404 is about, resolved from the request path (#317). */
export type NotFoundScope = {
  kind: "organization" | "project" | "page";
  org?: { slug: string; name: string };
  project?: { slug: string };
  /** Leading URL segments that are real entities (kept in the breadcrumb). */
  depth: number;
};

/**
 * For the shell not-found page: never throws, never echoes an unknown slug.
 * Only reports an org or project the user can actually access.
 */
export async function resolveNotFoundScope(): Promise<NotFoundScope> {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const [orgSlug, projectSlug] = pathname.split("/").filter(Boolean);
  if (!orgSlug || isReservedOrgSlug(orgSlug)) return { kind: "page", depth: 0 };
  const session = await getServerSession().catch(() => null);
  if (!session) return { kind: "page", depth: 0 };
  const org = await resolveOrganizationForPage(session.user.id, orgSlug).catch(
    () => null,
  );
  if (!org) return { kind: "organization", depth: 0 };
  const orgRef = { slug: org.slug, name: org.name };
  if (!projectSlug || isReservedProjectSlug(projectSlug)) {
    return { kind: "page", org: orgRef, depth: 1 };
  }
  const project = await resolveProjectForPage(
    session.user.id,
    projectSlug,
    org.id,
  ).catch(() => null);
  if (!project) return { kind: "project", org: orgRef, depth: 1 };
  return {
    kind: "page",
    org: orgRef,
    project: { slug: project.slug },
    depth: 2,
  };
}
