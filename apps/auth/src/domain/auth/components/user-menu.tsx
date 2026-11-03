"use client";

import {
  HeaderUserMenu,
  type UserMenuProps,
} from "@features/patterns/core/client/patterns.sidebar-kit";
import { docsUrl } from "@features/shell/utils/shell.platform-urls.utils";
import { routes } from "@features/shell/utils/shell.studio-routes.utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/lib/base-path";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";
import { studioDashboardPath } from "@/lib/studio-url";
import { trpc } from "@/utils/trpc";
import { performSignOut, useSession } from "../lib/auth-actions";

/** Props for the shared user menu, used by the header avatar and sidebar footer. */
export function useUserMenuProps(): UserMenuProps & { ready: boolean } {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const { data } = useQuery({
    ...trpc.sidebar.navigator.queryOptions(),
    staleTime: 30_000,
  });
  const orgSlug = data?.organizationSlug ?? null;
  return {
    ready: !isPending,
    user: session?.user ?? null,
    accountHref: withBasePath("/settings/profile"),
    organizationSettingsHref:
      isOrganizationsEnabledOnClient() && orgSlug
        ? studioDashboardPath(routes.orgSection(orgSlug, "settings"))
        : null,
    docsHref: docsUrl(),
    supportHref: studioDashboardPath(routes.supportTickets()),
    onSignOut: () => performSignOut({ queryClient, router }),
  };
}

export function UserMenu() {
  const { ready, ...props } = useUserMenuProps();
  if (!ready || !props.user) {
    return (
      <span
        aria-hidden
        className="border-border/60 bg-muted size-8 shrink-0 animate-pulse rounded-md border"
      />
    );
  }
  return <HeaderUserMenu {...props} />;
}
