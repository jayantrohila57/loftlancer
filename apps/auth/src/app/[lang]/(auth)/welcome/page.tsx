import { AuthWelcomeScreen } from "@modules/auth"
import { requireAccountSession } from "@/shared/auth/auth.session"
import { buildStudioLocalePath } from "@/shared/auth/auth-studio-app-url"
import type { LangPageProps } from "@/shared/types/auth.app.types"

export default async function Page({ params }: LangPageProps) {
  const { lang } = await params
  await requireAccountSession(params)
  return <AuthWelcomeScreen studioURL={buildStudioLocalePath(lang, "")} />
}
