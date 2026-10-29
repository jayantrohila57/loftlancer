"use client";

import { SidebarMenuButton, SidebarMenuItem } from "@loftlancer/ui/sidebar";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { AppGlyph } from "@/module/apps/apps.app.glyph";
import { useProjectApps } from "@/module/apps/apps.use.project.apps";
import { routes } from "@/utils/navigation";

/** Installed apps nested under the active project (apps system, #245). */
export function SidebarProjectApps({ slug }: { slug: string }) {
  const org = useCurrentOrgSlug();
  const pathname = usePathname();
  const { installed, isLoading } = useProjectApps(slug);
  if (isLoading || !org) return null;
  const items = installed.map((a) => ({
    key: a.id,
    label: a.name,
    icon: a.icon,
    href: routes.app(org, slug, a.nav[0]?.path ?? a.id),
  }));
  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem
          key={item.key}
          className="ps-4 group-data-[collapsible=icon]:hidden"
        >
          <SidebarMenuButton
            size="sm"
            isActive={
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            }
            render={<Link href={item.href as Route} />}
          >
            <AppGlyph
              icon={item.icon}
              className="size-5 rounded-md border-0 bg-transparent"
            />
            <span className="truncate">{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
