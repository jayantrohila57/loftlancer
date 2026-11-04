import { LegalPage } from "@modules/www/client/www/components/client.legal-navigation.component";

export default function SecurityPage() {
  return (
    <LegalPage href="/legal/security" title="Security">
      <p>
        This page does not yet describe the hosted service&apos;s security
        controls. Review of the security policy is in progress. The{" "}
        <a href="https://github.com/jayantrohila57/loftlancer">
          public source repository
        </a>{" "}
        and project documentation describe the software and its deployment
        requirements; they are not a statement of the hosted service&apos;s
        security controls.
      </p>
    </LegalPage>
  );
}
