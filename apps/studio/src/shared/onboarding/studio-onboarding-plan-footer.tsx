import { Button } from "@packages/ui/components/button"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import {
  completeStudioOnboardingPlanStep,
  skipStudioOnboardingPlanStep,
} from "@/shared/onboarding/studio-onboarding.actions.server"
import type { LangRouteParams } from "@/shared/types/studio.app.types"

export async function StudioOnboardingPlanFooter({
  params,
}: {
  readonly params: Promise<LangRouteParams>
}) {
  const { lang } = await params
  const t = await getServerTranslations(params, "ui")

  return (
    <>
      <form action={skipStudioOnboardingPlanStep.bind(null, lang)}>
        <Button type="submit" variant="outline">
          {t("skip")}
        </Button>
      </form>
      <form action={completeStudioOnboardingPlanStep.bind(null, lang)}>
        <Button type="submit">{t("continueToInvite")}</Button>
      </form>
    </>
  )
}
