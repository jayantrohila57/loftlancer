"use client";

import { MarketingSiteHeader } from "@loftlancer/ui/marketing";
import { MenuItem } from "@loftlancer/ui/menu";
import { useDocsLayout } from "fumadocs-ui/layouts/docs";
import { ModeToggle } from "@/components/mode-toggle";

export function DocsMarketingHeader() {
  const { slots } = useDocsLayout();
  const { open, setOpen } = slots.sidebar.useSidebar();

  return (
    <div className="[grid-area:header]">
      <MarketingSiteHeader
        signInHref="/sign-in"
        headerActions={<ModeToggle />}
        mobileMenuActions={
          <MenuItem
            nativeButton
            render={<button type="button" />}
            onClick={() => setOpen(!open)}
          >
            {open
              ? "Close documentation navigation"
              : "Open documentation navigation"}
          </MenuItem>
        }
      />
    </div>
  );
}
