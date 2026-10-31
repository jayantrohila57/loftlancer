import type { Metadata } from "next";
import { Landing } from "@/components/landing";

export const metadata: Metadata = {
  title: "Sign in · Loftlancer",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <Landing />;
}
