import { AuthSsoSignInScreen } from "@modules/auth/client/components/sign-in/sso/auth.sso-sign-in-screen"
import { Suspense } from "react"
import { buildReturnToQuery, pickReturnTo } from "@/shared/auth/auth.return-to"
import { redirectAuthenticatedUser } from "@/shared/auth/auth.session"
import { buildWebLocalePath } from "@/shared/auth/auth-web-app-url"
import type { LangPageProps } from "@/shared/types/auth.app.types"
import { authBasePath } from "../../../../../../auth.config"

type SsoSignInPageProps = LangPageProps & {
  searchParams: Promise<{ returnTo?: string | string[] }>
}

export default async function SsoSignInPage({
  params,
  searchParams,
}: SsoSignInPageProps) {
  const [{ lang }, resolvedSearch] = await Promise.all([params, searchParams])
  const { returnTo } = resolvedSearch
  await redirectAuthenticatedUser(params, pickReturnTo(returnTo))
  const returnToQuery = buildReturnToQuery(returnTo)
  return (
    <Suspense fallback={null}>
      <AuthSsoSignInScreen
        backToSignInHref={`${authBasePath}/${lang}/sign-in${returnToQuery}`}
        docsHref={buildWebLocalePath(lang, "/help")}
      />
    </Suspense>
  )
}
