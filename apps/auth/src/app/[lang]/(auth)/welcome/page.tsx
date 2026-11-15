import { AuthWelcomeScreen } from "@modules/auth"
import { requireAccountSession } from "@/shared/auth/auth.session"
import type { LangPageProps } from "@/shared/types/auth.app.types"

export default async function Page({ params }: LangPageProps) {
  await requireAccountSession(params)
  return <AuthWelcomeScreen />
}
