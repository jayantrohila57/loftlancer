import { MarketingPageShell } from "@features/marketing/core/client";
import { ModeToggle } from "@features/patterns/core/client/patterns.mode-toggle";

export default function LegalLayout({
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
