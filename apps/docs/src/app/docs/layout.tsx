import { VersionBadge } from "@loftlancer/ui/patterns/version-badge";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { DocsMarketingHeader } from "@/components/docs-marketing-header";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions()}
      containerProps={{
        style: {
          gridTemplate: `"header header header header header"
            "sidebar sidebar toc-popover toc toc"
            "sidebar sidebar tabs toc toc"
            "sidebar sidebar main toc toc" 1fr / var(--fd-docs-layout-columns)`,
        },
      }}
      sidebar={{ footer: <VersionBadge /> }}
      slots={{ header: DocsMarketingHeader }}
    >
      {children}
    </DocsLayout>
  );
}
