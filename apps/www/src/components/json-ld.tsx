import { ogImage, siteDescription, siteName, siteUrl } from "@/lib/seo";

const GITHUB_REPO = "https://github.com/jayantrohila57/loftlancer";

/**
 * Organization + WebSite + SoftwareApplication structured data for the home
 * page. Every field mirrors something visible on the site: the landing copy,
 * the GitHub link in the docs nav, and the free early-access /pricing page.
 */
export function HomeJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/favicon/web-app-manifest-512x512.png`,
        sameAs: [GITHUB_REPO],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        image: `${siteUrl}${ogImage.url}`,
        publisher: { "@id": `${siteUrl}/#organization` },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free during early access.",
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD built from constants
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
