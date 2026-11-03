import { PageHeaderDescription } from "@features/patterns/core/client/patterns.page-header-description";
import {
  pageHeaderDescriptionGridClass,
  pageHeaderRootClass,
  pageHeaderTitleClass,
  pageHeaderTitleRowClass,
} from "@features/patterns/utils/patterns.page-header-classes.utils";
import type { ReactNode } from "react";
import { AccountSettingsTabs } from "./settings.navigation";

/** Server-rendered frame; only its route-aware navigation is interactive. */
export function AccountSettingsFrame({ children }: { children: ReactNode }) {
  return (
    <div data-testid="settings-frame" className="w-full min-w-0 space-y-4">
      <header className={pageHeaderRootClass} data-slot="page-header">
        <div
          className={`${pageHeaderDescriptionGridClass} grid-cols-1 [grid-template-areas:'title'_'desc'] md:[grid-template-areas:'title'_'desc']`}
        >
          <div className={`${pageHeaderTitleRowClass} [grid-area:title]`}>
            <h1 className={pageHeaderTitleClass}>Account settings</h1>
          </div>
          <div
            className="hidden [grid-area:action]"
            data-slot="page-header-actions"
            aria-hidden
          />
          <div className="[grid-area:desc]">
            <PageHeaderDescription text="Manage your profile and security settings." />
          </div>
        </div>
        <AccountSettingsTabs />
      </header>
      <div className="min-w-0 space-y-4">{children}</div>
    </div>
  );
}
