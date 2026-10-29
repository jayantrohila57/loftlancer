"use client";

import {
  HeaderUserMenu,
  type UserMenuProps,
} from "@loftlancer/ui/patterns/sidebar-kit";
import { docsUrl } from "@loftlancer/ui/platform-urls";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { accountSettingsUrl } from "@/lib/account-url";
import { withBasePath } from "@/lib/base-path";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { performSignOut, useSession } from "@/module/auth/auth.auth.actions";
import { routes } from "@/utils/navigation";

/** Props for the shared user menu, used by the header avatar and sidebar footer. */
export function useUserMenuProps(): UserMenuProps & { ready: boolean } {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  // Same org as the switcher: the URL org, else the last active org (#313).
  const orgSlug = useCurrentOrgSlug();
  return {
    ready: !isPending,
    user: session?.user ?? null,
    accountHref: accountSettingsUrl(),
    organizationSettingsHref:
      isOrganizationsEnabledOnClient() && orgSlug
        ? withBasePath(routes.orgSection(orgSlug, "settings"))
        : null,
    docsHref: docsUrl(),
    supportHref: withBasePath(routes.supportTickets()),
    onSignOut: () => performSignOut({ queryClient, router }),
  };
}

export function UserMenu() {
  const { ready, ...props } = useUserMenuProps();
  if (!ready || !props.user) {
    return (
      <span
        aria-hidden
        className="size-8 shrink-0 animate-pulse rounded-md border border-border/60 bg-muted"
      />
    );
  }
  return <HeaderUserMenu {...props} />;
}
