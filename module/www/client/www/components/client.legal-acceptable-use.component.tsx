import { LegalPage } from "@modules/www/client/www/components/client.legal-navigation.component";

export default function AcceptableUsePage() {
  return (
    <LegalPage href="/legal/acceptable-use" title="Acceptable use">
      <p>
        Do not use Loftlancer to violate others&apos; rights, bypass
        authorization, or distribute malware. Full acceptable-use language will
        be added after legal review.
      </p>
    </LegalPage>
  );
}
