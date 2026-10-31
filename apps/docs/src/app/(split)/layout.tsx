import { MarketingPageShell } from "@loftlancer/ui/marketing";
import { ModeToggle } from "@/components/mode-toggle";

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
