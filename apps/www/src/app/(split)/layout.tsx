import { MarketingPageShell } from "@features/marketing/core/client";
import { ModeToggle } from "@features/patterns/core/client/patterns.mode-toggle";

/** Shared public marketing shell for secondary marketing pages. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingPageShell signInHref="/sign-in" headerActions={<ModeToggle />}>
      {children}
    </MarketingPageShell>
  );
}
