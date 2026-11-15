import { AuthSignInScreen } from "@modules/auth"
import { readSocialProviderAvailability } from "@packages/better-auth"
import { buildReturnToQuery, pickReturnTo } from "@/shared/auth/auth.return-to"
import { redirectAuthenticatedUser } from "@/shared/auth/auth.session"
import type { LangPageProps } from "@/shared/types/auth.app.types"
import { authBasePath } from "../../../../../auth.config"

type SignInPageProps = LangPageProps & {
  searchParams: Promise<{ returnTo?: string | string[] }>
}

export default async function SignInPage({
  params,
  searchParams,
}: SignInPageProps) {
  const [{ lang }, resolvedSearch] = await Promise.all([params, searchParams])
  const { returnTo } = resolvedSearch
  await redirectAuthenticatedUser(params, pickReturnTo(returnTo))
  const returnToQuery = buildReturnToQuery(returnTo)
  return (
    <AuthSignInScreen
      enterpriseSsoHref={`${authBasePath}/${lang}/sign-in/sso${returnToQuery}`}
      socialProviders={readSocialProviderAvailability()}
    />
  )
}
