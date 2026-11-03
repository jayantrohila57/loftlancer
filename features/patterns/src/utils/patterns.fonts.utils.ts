import { Geist_Mono, Inter } from "next/font/google";

/**
 * Shared root fonts for every Loftlancer app (docs, studio, auth).
 * Exposes `--font-sans` / `--font-mono`, consumed by `@loftlancer/ui/globals.css`.
 */
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

/** Apply on `<html>` in each app's root layout. */
export const rootFontClassName = `font-sans ${fontSans.variable} ${fontMono.variable}`;
