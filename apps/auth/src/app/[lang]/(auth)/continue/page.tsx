import { SecurityLocationPrompt } from "@modules/location"
import { resolveContinueDestination } from "@/shared/auth/auth.first-login-destination"
import { pickReturnTo } from "@/shared/auth/auth.return-to"
import { requireAccountSession } from "@/shared/auth/auth.session"
import type { LangPageProps } from "@/shared/types/auth.app.types"

type ContinuePageProps = LangPageProps & {
  searchParams: Promise<{
    returnTo?: string | string[]
    newUser?: string | string[]
  }>
}

export default async function ContinuePage({
  params,
  searchParams,
}: ContinuePageProps) {
  const session = await requireAccountSession(params)
  const [routeParams, query] = await Promise.all([params, searchParams])
  const returnTo = pickReturnTo(query.returnTo)
  const newUser = pickReturnTo(query.newUser) === "1"
  const destination = await resolveContinueDestination({
    lang: routeParams.lang,
    newUser,
    returnTo,
    userId: session.user.id,
  })
  return <SecurityLocationPrompt destination={destination} />
}
