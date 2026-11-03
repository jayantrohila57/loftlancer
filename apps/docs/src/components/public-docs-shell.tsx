"use client";

import { resolveAuthAppOrigin } from "@features/authentication/utils/auth-links";
import { performPlatformSignOut } from "@features/authentication/utils/platform-sign-out";
import {
  type PublicNavGroup,
  PublicSidebar,
} from "@features/patterns/core/client/patterns.sidebar-kit";
import { PublicAppShell } from "@features/shell/core/client";
import {
  ActivityIcon,
  BookOpenIcon,
  CookieIcon,
  FileTextIcon,
  HistoryIcon,
  LifeBuoyIcon,
  LockIcon,
  ScaleIcon,
  ShieldIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

const groups: PublicNavGroup[] = [
  {
    label: "Docs",
    items: [
      { label: "Documentation", href: "/docs", icon: BookOpenIcon },
      { label: "Changelog", href: "/changelog", icon: HistoryIcon },
      { label: "Status", href: "/status", icon: ActivityIcon },
    ],
  },
  {
    label: "Support",
    items: [{ label: "Contact", href: "/legal/contact", icon: LifeBuoyIcon }],
  },
  {
    label: "Legal",
    items: [
      { label: "Terms", href: "/terms", icon: ScaleIcon },
      { label: "Privacy", href: "/privacy", icon: LockIcon },
      {
        label: "Acceptable use",
        href: "/legal/acceptable-use",
        icon: FileTextIcon,
      },
      { label: "Cookies", href: "/legal/cookies", icon: CookieIcon },
      {
        label: "Data processing agreement",
        href: "/legal/dpa",
        icon: FileTextIcon,
      },
      { label: "Security", href: "/legal/security", icon: ShieldIcon },
    ],
  },
];

/** Shared app shell for documentation, with session-aware public navigation. */
export function PublicDocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const auth = resolveAuthAppOrigin();

  return (
    <PublicAppShell
      title="Documentation"
      sidebar={
        <PublicSidebar
          homeHref="/"
          groups={groups}
          currentPath={pathname}
          sessionUrl={`${auth}/api/auth/get-session`}
          signInHref="/sign-in"
          onSignOut={() =>
            performPlatformSignOut({
              signOutLocal: () =>
                fetch(`${auth}/api/auth/sign-out`, {
                  method: "POST",
                  credentials: "include",
                  headers: { "content-type": "application/json" },
                  body: "{}",
                }),
            })
          }
          accountHref={`${auth}/settings/profile`}
          docsHref="/docs"
        />
      }
    >
      {children}
    </PublicAppShell>
  );
}
