import { LegalPage } from "@modules/www/client/www/components/client.legal-navigation.component";

export default function DpaPage() {
  return (
    <LegalPage href="/legal/dpa" title="Data processing agreement (DPA)">
      <p>
        Data processing terms for enterprise customers will be published here.
        Self-hosted operators remain responsible for their own data processing
        agreement obligations.
      </p>
    </LegalPage>
  );
}
