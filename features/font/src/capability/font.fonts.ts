import localFont from "next/font/local"

export const fontSans = localFont({
  src: "../assets/outfit.ttf",
  variable: "--font-sans",
  weight: "100 900",
})

export const fontMono = localFont({
  src: "../assets/geist-mono.ttf",
  variable: "--font-mono",
  weight: "400 700",
})
