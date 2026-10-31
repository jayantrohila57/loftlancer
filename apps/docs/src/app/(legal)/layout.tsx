import { MarketingPageShell } from "@loftlancer/ui/marketing";
import { ModeToggle } from "@/components/mode-toggle";

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
