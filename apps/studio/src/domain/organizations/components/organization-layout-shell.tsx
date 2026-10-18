"use client";

import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import {
  SettingsFrame,
  SettingsRailCard,
} from "@loftlancer/ui/patterns/settings-frame";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { trpc } from "@/utils/trpc";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { useOrganizationTabs } from "../hooks/use-organization-tabs";

function OrganizationHealthCard() {
  const { data, isError } = useQuery(
    trpc.dashboard.getOrgSettingsStats.queryOptions(undefined, {
      retry: false,
    }),
  );
  if (!data || isError) return null;

  const rows: [string, ReactNode][] = [
    [
      "Your role",
      <span key="role" className="capitalize">
        {data.role}
      </span>,
    ],
    ["Members", data.memberCount],
    ["Pending invites", data.pendingInvites],
    ["Projects", data.projectCount],
  ];

  return (
    <SettingsRailCard title="Health">
      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </SettingsRailCard>
  );
}

/** Stable organization identity and navigation shared by every org route. */
export function OrganizationLayoutShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { organization, listItem, status } = useOrganizationBySlug(slug);
  if (status === "not-found") notFound();
  const { tabs } = useOrganizationTabs(slug);
  const pathname = usePathname() ?? "";
  const name = organization?.name ?? listItem?.name ?? slug;

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={{ href: "/studio", label: "Organizations" }}
      avatar={{ src: organization?.logo, name }}
      title={name}
      description="Organization workspace and administration."
      identity={name}
      subtitle={`/${slug}`}
      tabs={tabs.map((tab) => ({
        href: tab.href ?? "#",
        label: tab.label,
        active: pathname === tab.href,
      }))}
      aside={
        organization ? (
          <>
            <SettingsRailCard
              title="Audit rail"
              items={[
                { label: "Organization ID", value: organization.id, copy: true },
                { label: "Slug", value: organization.slug, copy: true },
                ...(organization.createdAt
                  ? [
                      {
                        label: "Created",
                        value: <LocalDateTime value={organization.createdAt} />,
                      },
                    ]
                  : []),
              ]}
            />
            <OrganizationHealthCard />
          </>
        ) : null
      }
    >
      {children}
    </SettingsFrame>
  );
}
