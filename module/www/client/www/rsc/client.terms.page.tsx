import {
  LegalPolicyNav,
  LegalReviewNotice,
} from "@modules/www/client/www/components/client.legal-navigation.component";
import { MarketingPage } from "@modules/www/client/www/components/client.marketing-page.component";
import { pageMetadata } from "@modules/www/utils/utils.seo-metadata.utils";

export const metadata = pageMetadata({
  title: "Terms",
  description:
    "Terms for using the hosted Loftlancer service during early access.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <MarketingPage
      title="Terms of use"
      description="Last updated November 2026."
      aside={<LegalPolicyNav currentHref="/terms" />}
    >
      <LegalReviewNotice />
      <h2>Service</h2>
      <p>
        Loftlancer is an early-access service. Features and interfaces may
        change as the product develops. Use the status page for current
        monitored-service information.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not use the service to violate others&apos; rights, distribute
        malware, access another person&apos;s data without permission, or bypass
        access controls.
      </p>
      <h2>Secrets</h2>
      <p>
        You are responsible for the configuration and secrets you store and for
        assigning appropriate access to your organization and projects.
      </p>
      <h2>Availability</h2>
      <p>
        Loftlancer does not offer an uptime SLA during early access. The status
        page reports checks for the services that are currently monitored.
      </p>
    </MarketingPage>
  );
}
