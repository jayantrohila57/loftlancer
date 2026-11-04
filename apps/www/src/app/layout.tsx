import { rootFontClassName } from "@features/patterns/utils/patterns.fonts.utils";
import { wwwRootMetadata } from "@modules/www/utils/utils.root-metadata.utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ConsentAnalytics } from "@/components/consent-analytics";
import "./globals.css";

export const metadata: Metadata = wwwRootMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={rootFontClassName}>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <ConsentAnalytics />
      </body>
    </html>
  );
}
