import { MarketingPage } from "@/components/marketing-page";

export default function TermsPage() {
  return (
    <MarketingPage
      title="Terms of use"
      description="Last updated October 2026."
    >
      <h2>Service</h2>
      <p>
        Loftlancer is provided as-is during early access. Features may change as
        we improve the service.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Do not use the service to store malware, violate others&apos; rights, or
        attempt to bypass encryption, access controls, or service limits.
      </p>
      <h2>Secrets</h2>
      <p>
        You are responsible for the configuration and secrets you store. Use
        organization roles and project access to control who can view or change
        information.
      </p>
      <h2>Availability</h2>
      <p>
        There is no uptime SLA on the free tier. If you run Loftlancer yourself,
        follow the setup documentation.
      </p>
    </MarketingPage>
  );
}
