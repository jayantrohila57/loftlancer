import { LegalPage } from "@modules/www/client/www/components/client.legal-navigation.component";

export default function CookiesPage() {
  return (
    <LegalPage href="/legal/cookies" title="Cookie policy">
      <p>
        Loftlancer uses session cookies to keep you signed in. The site also
        stores your analytics choice in this browser&apos;s local storage.
      </p>
      <p>
        Optional Google Analytics on the public site and PostHog in the
        dashboard stay off until you accept them in the consent banner. The
        choice is stored in local storage on this browser. Vercel Web Analytics
        and Speed Insights are enabled separately for service measurement. The
        table below lists where each analytics service is used.
      </p>
      <table>
        <caption>Optional analytics providers</caption>
        <thead>
          <tr>
            <th scope="col">Service</th>
            <th scope="col">Where it is used</th>
            <th scope="col">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Google Analytics</th>
            <td>Public website</td>
            <td>Measures visits and page views after consent.</td>
          </tr>
          <tr>
            <th scope="row">PostHog</th>
            <td>Dashboard</td>
            <td>Helps us understand feature usage after consent.</td>
          </tr>
          <tr>
            <th scope="row">Vercel Web Analytics</th>
            <td>Public website and application</td>
            <td>Measures page views without cookies.</td>
          </tr>
          <tr>
            <th scope="row">Vercel Speed Insights</th>
            <td>Public website and application</td>
            <td>Measures page performance.</td>
          </tr>
        </tbody>
      </table>
    </LegalPage>
  );
}
