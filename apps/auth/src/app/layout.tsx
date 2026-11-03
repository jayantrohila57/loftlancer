import { rootFontClassName } from "@features/patterns/utils/patterns.fonts.utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";

import Providers from "@/components/providers";

import "../index.css";

export const metadata: Metadata = {
  // Same "Page | Loftlancer" titles as studio (#328).
  title: {
    default: "Loftlancer",
    template: "%s | Loftlancer",
  },
  description: "Authentication for Loftlancer platform apps.",
  // Private app: sign-in and account pages are never indexed (#352).
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={rootFontClassName}>
      <body className="bg-background relative min-h-svh antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
