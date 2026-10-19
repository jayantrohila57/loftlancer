"use client";

import { usePathname } from "next/navigation";
import type { PageHeaderTab } from "@/components/layout/page-header";
import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";

/** Project navigation stays focused on the project and its app directory. */
export function useProjectTabs(slug: string) {
  const org = useOrgSlug();
  const pathname = usePathname() ?? "";
  const base = routes.project(org, slug);

  const tabs: PageHeaderTab[] = [
    { value: "overview", label: "Overview", href: base },
    { value: "apps", label: "Apps", href: `${base}/apps` },
  ];

  const rest = pathname.startsWith(base)
    ? pathname.slice(base.length).split("/").filter(Boolean)
    : [];
  const firstSegment = rest[0];
  const activeTab =
    !firstSegment || firstSegment === "overview"
      ? "overview"
      : firstSegment === "settings"
        ? ""
        : "apps";
  return { tabs, activeTab };
}
