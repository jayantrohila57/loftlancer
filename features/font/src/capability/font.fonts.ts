import localFont from "next/font/local"

export const fontSans = localFont({
  src: "../assets/instrument-sans.ttf",
  variable: "--font-sans",
  weight: "400 700",
})

export const fontMono = localFont({
  src: "../assets/geist-mono.ttf",
  variable: "--font-mono",
  weight: "400 700",
})
