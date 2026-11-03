"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Product reset: domain breadcrumbs simplified. */
export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean).slice(0, 2);
  if (parts.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className={className ?? "text-muted-foreground text-sm"}
    >
      <ol className="flex gap-2">
        {parts.map((part, index) => {
          const href = `/${parts.slice(0, index + 1).join("/")}`;
          return (
            <li key={href}>
              {index > 0 ? <span className="mx-1">/</span> : null}
              <Link href={href}>{part}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
