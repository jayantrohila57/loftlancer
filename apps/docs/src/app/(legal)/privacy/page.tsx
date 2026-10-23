import { MarketingPage } from "@/components/marketing-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy",
  description: "How Loftlancer handles account and configuration data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <MarketingPage
      title="Privacy policy"
      description="Last updated October 2026. This describes product behavior reflected in the codebase."
    >
      <h2>What we store</h2>
      <p>
        When you sign in, your account and session details are stored securely.
        Organizations, projects, environments, and variables are stored in the
        service. Secret variable values are encrypted before they are stored.
      </p>
      <h2>How we use data</h2>
      <p>
        Data is used to operate the dashboard, enforce permissions, send in-app
        notifications when enabled, and write audit events when audit is
        enabled. We do not sell personal data.
      </p>
      <h2>Third parties</h2>
      <p>
        External providers help us run the service, store data, send email,
        protect accounts, and understand reliability. Optional analytics load
        only after you accept them in the cookie banner; you can decline and
        nothing is loaded. See the provider table below and the{" "}
        <a href="/legal/cookies">cookie policy</a> for optional analytics
        details.
      </p>
      <table>
        <caption>Service providers</caption>
        <thead>
          <tr>
            <th scope="col">Service</th>
            <th scope="col">Provider</th>
            <th scope="col">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Hosting</th>
            <td>Vercel</td>
            <td>Runs the Loftlancer websites and application.</td>
          </tr>
          <tr>
            <th scope="row">Database</th>
            <td>Neon</td>
            <td>
              Stores account, organization, project, and configuration data.
            </td>
          </tr>
          <tr>
            <th scope="row">Sign-in</th>
            <td>GitHub OAuth</td>
            <td>Provides sign-in and account identity.</td>
          </tr>
          <tr>
            <th scope="row">Email</th>
            <td>Resend</td>
            <td>Sends invitations and other transactional email.</td>
          </tr>
          <tr>
            <th scope="row">Error reporting</th>
            <td>Sentry</td>
            <td>Helps identify and resolve application errors.</td>
          </tr>
          <tr>
            <th scope="row">Rate limiting</th>
            <td>Upstash Redis</td>
            <td>Helps protect service endpoints from excessive requests.</td>
          </tr>
          <tr>
            <th scope="row">File storage</th>
            <td>Vercel Blob</td>
            <td>Stores uploaded files when the feature is enabled.</td>
          </tr>
          <tr>
            <th scope="row">Performance measurement</th>
            <td>Vercel Web Analytics and Speed Insights</td>
            <td>Measures page visits and performance without cookies.</td>
          </tr>
        </tbody>
      </table>
      <h2>Your choices</h2>
      <p>
        You can review active sessions and request account deletion in account
        settings. For data requests about a self-hosted copy of Loftlancer,
        contact the person who operates it.
      </p>
    </MarketingPage>
  );
}
