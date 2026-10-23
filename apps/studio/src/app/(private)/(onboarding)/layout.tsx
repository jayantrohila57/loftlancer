import {
  Auth5Branding,
  Auth5Content,
  Auth5Frame,
} from "@loftlancer/ui/patterns/auth-5";
import { ActiveOrganizationProvider } from "@/components/org/active-organization-context";

/**
 * Onboarding sits outside the dashboard shell in the auth-5 split layout, so it
 * needs its own ActiveOrganizationProvider (the dashboard shell owns the other
 * one). Without it the page 500s (#252).
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ActiveOrganizationProvider>
      <Auth5Frame brandContent={<Auth5Branding />}>
        <Auth5Content>{children}</Auth5Content>
      </Auth5Frame>
    </ActiveOrganizationProvider>
  );
}
