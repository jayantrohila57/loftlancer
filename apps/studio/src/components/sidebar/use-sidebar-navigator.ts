"use client";

import type {
  CommandGroup,
  FavoriteProject,
} from "@loftlancer/ui/patterns/sidebar-kit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";
import { useNavigatorQuery } from "./use-navigator-query";

/**
 * Real data for the shared sidebar (⌘K groups, Favorites, nav counts).
 * `projectHref`/`settingsLinks` let each app build its own URLs.
 */
export function useSidebarNavigator(opts: {
  projectHref: (orgSlug: string, slug: string) => string;
  envHref: (orgSlug: string, projectSlug: string, envSlug: string) => string;
  memberHref: (orgSlug: string, userId: string) => string;
  teamHref: (orgSlug: string, teamId?: string) => string;
  settingsLinks: { label: string; href: string }[];
}) {
  const qc = useQueryClient();
  const query = useNavigatorQuery();
  const data = query.data;
  const pinMutation = useMutation(
    trpc.sidebar.pin.mutationOptions({
      onSettled: () =>
        qc.invalidateQueries({ queryKey: trpc.sidebar.navigator.pathKey() }),
      onError: (error) =>
        toast.error("Could not update favorites", {
          description: error.message,
        }),
    }),
  );

  const { projectHref, envHref, memberHref, teamHref, settingsLinks } = opts;
  const org = data?.organizationSlug ?? "";
  const groups = useMemo<CommandGroup[]>(() => {
    const projects = org ? (data?.projects ?? []) : [];
    return [
      {
        heading: "Projects",
        icon: "project",
        items: projects.map((p) => ({
          id: `p:${p.id}`,
          label: p.name,
          href: projectHref(org, p.slug),
          keywords: p.slug,
        })),
      },
      {
        heading: "Teams",
        icon: "member",
        items: (data?.teams ?? []).map((team) => ({
          id: `t:${team.id}`,
          label: team.name,
          href: org ? teamHref(org, team.id) : "/studio",
          keywords: "team organization",
        })),
      },
      {
        heading: "Environments",
        icon: "env",
        items: projects.flatMap((p) =>
          p.environments.map((e) => ({
            id: `e:${p.id}:${e.slug}`,
            label: e.name,
            hint: p.name,
            href: envHref(org, p.slug, e.slug),
            keywords: `${p.slug} ${e.slug}`,
          })),
        ),
      },
      {
        heading: "Settings",
        icon: "settings",
        items: settingsLinks.map((s) => ({
          id: `s:${s.href}`,
          label: s.label,
          href: s.href,
        })),
      },
      {
        heading: "Members",
        icon: "member",
        items: (data?.organizationSlug ? (data?.members ?? []) : []).map(
          (m) => ({
            id: `m:${m.userId}`,
            label: m.name || m.email,
            hint: m.email,
            href: memberHref(data?.organizationSlug ?? "", m.userId),
          }),
        ),
      },
    ];
  }, [data, org, projectHref, envHref, memberHref, teamHref, settingsLinks]);

  const pins = data?.pins ?? [];
  const favorites = useMemo<FavoriteProject[]>(() => {
    if (!org) return [];
    const byId = new Map((data?.projects ?? []).map((p) => [p.id, p]));
    return pins.flatMap((id) => {
      const p = byId.get(id);
      if (!p) return [];
      const prod = p.environments.find((e) => e.isProduction);
      const env = prod ?? p.environments[0];
      return [
        {
          id: p.id,
          label: p.name,
          href: projectHref(org, p.slug),
          env: env
            ? {
                label: prod
                  ? "Prod"
                  : env.name.length > 8
                    ? `${env.name.slice(0, 7)}…`
                    : env.name,
                production: Boolean(prod),
              }
            : null,
        },
      ];
    });
  }, [data, org, pins, projectHref]);

  return {
    loading: query.isPending,
    groups,
    favorites,
    favoriteCount: pins.length,
    counts: data?.counts,
    organizationSlug: data?.organizationSlug ?? null,
    isPinned: (projectId: string) => pins.includes(projectId),
    togglePin: (projectId: string) =>
      pinMutation.mutate({ projectId, pinned: !pins.includes(projectId) }),
    pinPending: pinMutation.isPending,
    refetch: query.refetch,
  };
}
