import { Button } from "@packages/ui/components/button"
import { getServerTranslations } from "@/shared/i18n/studio.i18n.server"
import {
  completeStudioOnboardingInviteStep,
  goToStudioOnboardingPlanStep,
} from "@/shared/onboarding/studio-onboarding.actions.server"
import type { LangRouteParams } from "@/shared/types/studio.app.types"

export async function StudioOnboardingInviteFooter({
  params,
}: {
  readonly params: Promise<LangRouteParams>
}) {
  const { lang } = await params
  const t = await getServerTranslations(params, "ui")

  return (
    <>
      <form action={goToStudioOnboardingPlanStep.bind(null, lang)}>
        <Button type="submit" variant="outline">
          {t("back")}
        </Button>
      </form>
      <form action={completeStudioOnboardingInviteStep.bind(null, lang)}>
        <Button type="submit" variant="outline">
          {t("skipThisStep")}
        </Button>
      </form>
    </>
  )
}
