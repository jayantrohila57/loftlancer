import { Landing } from "@modules/www/client/www/rsc/client.sign-in.page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in · Loftlancer",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return <Landing />;
}
