import { LegalPage } from "@modules/www/client/www/components/client.legal-navigation.component";

export default function SecurityPage() {
  return (
    <LegalPage href="/legal/security" title="Security">
      <p>
        Security practices for the hosted platform are documented in the docs
        site and deployment runbook. Final policy text is pending owner review.
      </p>
    </LegalPage>
  );
}
