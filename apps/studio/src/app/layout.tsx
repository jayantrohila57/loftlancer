import { rootFontClassName } from "@features/patterns/utils/patterns.fonts.utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";

import "../index.css";
import { ConsentAnalytics } from "@/components/consent-analytics";
import Providers from "@/components/providers";
import { generateMetadata as generateSiteMetadata } from "@/lib/siteConfig";

export const metadata: Metadata = generateSiteMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={rootFontClassName}>
      <body className="relative antialiased">
        <div className="relative isolate flex min-h-svh min-w-0 flex-col">
          <Providers>{children}</Providers>
        </div>
        <Analytics />
        <SpeedInsights />
        <ConsentAnalytics />
      </body>
    </html>
  );
}
