import { OrgCreateScreen } from "@modules/org/account-screens"

import { isAllowedBillingReturnUrl } from "@/shared/auth/auth.destination"

export default async function OrganizationsCreatePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>
}) {
  const params = await searchParams
  const raw = params.returnTo
  const value = Array.isArray(raw) ? raw[0] : raw
  const returnTo =
    typeof value === "string" && isAllowedBillingReturnUrl(value)
      ? value
      : undefined
  return <OrgCreateScreen returnTo={returnTo} />
}
