import { redirectStudioOnboardingEntry } from "@/shared/onboarding/studio-onboarding.guard.server"
import type { LangPageProps } from "@/shared/types/studio.app.types"

export default async function StudioOnboardingPage({ params }: LangPageProps) {
  const { lang } = await params
  await redirectStudioOnboardingEntry(lang)
}
