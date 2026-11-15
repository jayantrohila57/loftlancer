import { SecurityLocationPrompt } from "@modules/location"
import { resolvePostSignInDestination } from "@/shared/auth/auth.post-sign-in"
import { pickReturnTo } from "@/shared/auth/auth.return-to"
import { requireAccountSession } from "@/shared/auth/auth.session"
import type { LangPageProps } from "@/shared/types/auth.app.types"

type ContinuePageProps = LangPageProps & {
  searchParams: Promise<{ returnTo?: string | string[] }>
}

export default async function ContinuePage({
  params,
  searchParams,
}: ContinuePageProps) {
  await requireAccountSession(params)
  const [routeParams, query] = await Promise.all([params, searchParams])
  const returnTo = pickReturnTo(query.returnTo)
  const destination = resolvePostSignInDestination({
    lang: routeParams.lang,
    returnTo,
  })
  return <SecurityLocationPrompt destination={destination} />
}
