import { AuthWelcomeScreen } from "@modules/auth"
import { requireAccountSession } from "@/shared/auth/auth.session"
import { serverEnv } from "@/shared/config/auth.server-env"
import type { LangPageProps } from "@/shared/types/auth.app.types"

function studioUrlForLang(lang: string) {
  const base = (serverEnv.STUDIO_APP_URL ?? "http://localhost:3003").replace(
    /\/$/,
    ""
  )
  return `${base}/${lang}`
}

export default async function Page({ params }: LangPageProps) {
  const { lang } = await params
  await requireAccountSession(params)
  return <AuthWelcomeScreen studioURL={studioUrlForLang(lang)} />
}
