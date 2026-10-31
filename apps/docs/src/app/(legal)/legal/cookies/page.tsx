import { LegalPage } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    title: "Cookie policy",
    description:
      "How Loftlancer uses cookies and remembers your analytics choice.",
    path: "/legal/cookies",
  }),
  // Placeholder copy: kept out of the index and sitemap until reviewed.
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      description="How Loftlancer uses cookies and remembers your analytics choice."
      href="/legal/cookies"
    >
      <p>
        Loftlancer uses cookies and local storage to keep you signed in and
        remember your analytics choice.
      </p>
      <p>
        Signing in sets the session cookies needed to keep you signed in.
        Optional analytics stay off until you accept them in the cookie banner.
        Your choice is saved in this browser and you can change it at any time.
        The table below lists the analytics providers and what they measure.
      </p>
      <table>
        <caption>Optional analytics providers</caption>
        <thead>
          <tr>
            <th scope="col">Provider</th>
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
        </tbody>
      </table>
    </LegalPage>
  );
}
