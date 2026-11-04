export function PrivacyProvidersSection() {
  return (
    <>
      <h2>Third parties</h2>
      <p>
        External services support hosting, data storage, account sign-in,
        transactional email, error reporting, and service measurement. Google
        Analytics on the public site and PostHog in the dashboard are optional
        and load only after you accept them in the consent banner. Vercel Web
        Analytics and Speed Insights are also enabled for service measurement.
        See the provider table below and the{" "}
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
            <td>GitHub OAuth and Google OAuth</td>
            <td>Provide optional OAuth sign-in and account identity.</td>
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
            <th scope="row">Optional analytics</th>
            <td>Google Analytics and PostHog</td>
            <td>
              Measures public-site visits and dashboard feature usage after
              consent.
            </td>
          </tr>
          <tr>
            <th scope="row">Service measurement</th>
            <td>Vercel Web Analytics and Speed Insights</td>
            <td>Measures page visits and site performance.</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
