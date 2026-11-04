import type { Metadata } from "next";

/** Canonical public origin. Every canonical, OG and sitemap URL hangs off it. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_WWW_URL?.trim() || "https://loftlancer.com"
).replace(/\/$/, "");

export const siteName = "Loftlancer";

export const siteDescription =
  "A shared workspace for teams to organize projects, manage access, and handle encrypted environment variables and project tasks.";

export const ogImage = {
  url: "/favicon/og-image.png",
  width: 1200,
  height: 630,
  alt: "Loftlancer",
} as const;

/**
 * Per-page metadata: unique title + description, a self-referencing canonical
 * and matching Open Graph / Twitter fields. `path` is the route ("/features").
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const ogTitle = absoluteTitle ? title : `${title} | ${siteName}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName,
      locale: "en_US",
      url: path,
      title: ogTitle,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImage.url],
    },
  };
}
