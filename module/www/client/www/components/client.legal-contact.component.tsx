import { LegalPage } from "@modules/www/client/www/components/client.legal-navigation.component";

export default function ContactPage() {
  return (
    <LegalPage href="/legal/contact" title="Contact">
      <p>
        For product support, sign in to your dashboard and open a ticket under
        Help. For legal or privacy requests, contact the repository owner listed
        on GitHub.
      </p>
    </LegalPage>
  );
}
