import { LegalPage } from "@modules/www/client/www/components/client.legal-navigation.component";

export default function DpaPage() {
  return (
    <LegalPage href="/legal/dpa" title="Data processing agreement (DPA)">
      <p>
        A data processing agreement for the hosted service is not available yet.
        Self-hosted operators are responsible for the terms and practices that
        apply to their own installations.
      </p>
    </LegalPage>
  );
}
