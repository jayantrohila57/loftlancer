import { redirectToExternalDestination } from "@features/i18n/redirect-external"
import { requireAccountSession } from "@/shared/auth/auth.session"
import { buildStudioLocalePath } from "@/shared/auth/auth-studio-app-url"
import type { LangPageProps } from "@/shared/types/auth.app.types"

export default async function Page({ params }: LangPageProps) {
  const { lang } = await params
  await requireAccountSession(params)
  redirectToExternalDestination(buildStudioLocalePath(lang, "/onboarding"))
}
