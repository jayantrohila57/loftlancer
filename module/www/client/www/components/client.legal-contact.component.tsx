import { LegalPage } from "@modules/www/client/www/components/client.legal-navigation.component";

export default function ContactPage() {
  return (
    <LegalPage href="/legal/contact" title="Contact">
      <p>
        For product support or feature requests, use the{" "}
        <a href="https://github.com/jayantrohila57/loftlancer/issues">
          project issue tracker
        </a>
        . For privacy or legal requests, contact the project owner through the{" "}
        <a href="https://github.com/jayantrohila57/loftlancer">
          Loftlancer GitHub repository
        </a>
        .
      </p>
    </LegalPage>
  );
}
