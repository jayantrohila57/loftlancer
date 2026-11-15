import { Geist_Mono, Outfit } from "next/font/google"

/** next/font requires static literals here (see Next.js font loader rules). */
export const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
