import { isOrganizationsEnabled } from "@loftlancer/t3-env/organizations";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { guardPageAction } from "@/lib/page-guards";
import { routes } from "@/utils/navigation";
import OnboardingClient from "./onboarding-client";

export const metadata: Metadata = {
  title: "Set up",
};

export default async function OnboardingPage() {
  if (!isOrganizationsEnabled()) {
    redirect(routes.home());
  }

  await guardPageAction("organization.create");

  return <OnboardingClient />;
}
