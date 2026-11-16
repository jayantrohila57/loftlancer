import { ShellAccountLoading } from "@modules/shell"
import type { ReactNode } from "react"
import { Suspense } from "react"
import { requireStudioOrganization } from "@/shared/auth/studio.session"
import { StudioRememberOrgCookie } from "@/shared/org/studio-org-cookie.client"
import type { OrgLayoutProps } from "@/shared/types/studio.app.types"

export const instant = false

export default async function StudioOrgLayout({
  children,
  params,
}: {
  readonly children: ReactNode
  readonly params: OrgLayoutProps["params"]
}) {
  const { lang, org } = await params
  await requireStudioOrganization(lang, org)
  return (
    <>
      <StudioRememberOrgCookie slug={org} />
      <Suspense fallback={<ShellAccountLoading />}>{children}</Suspense>
    </>
  )
}
