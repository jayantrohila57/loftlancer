import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { CSSProperties, ReactNode } from "react";
import { PublicDocsShell } from "@/components/public-docs-shell";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

/**
 * Fumadocs continues to own document rendering and the in-page table of
 * contents. The shared public app shell owns all site-level navigation.
 */
export default function DocsRootLayout({ children }: { children: ReactNode }) {
  return (
    <PublicDocsShell>
      <DocsLayout
        tree={source.pageTree}
        {...baseOptions()}
        nav={{ enabled: false }}
        sidebar={{ enabled: false }}
        tabs={false}
        containerProps={{
          className: "min-h-full",
          style: {
            gridTemplate: '"main toc" 1fr / minmax(0, 1fr) var(--fd-toc-width)',
            "--fd-docs-height": "100%",
          } as CSSProperties,
        }}
      >
        {children}
      </DocsLayout>
    </PublicDocsShell>
  );
}
