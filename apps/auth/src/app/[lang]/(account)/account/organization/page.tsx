import { AccountPageSection } from "@/shared/shell/account-page-section"
import { OrganizationAccountSections } from "@/shared/shell/account-section-frames"

export function AuthAccountOrganizationView() {
  return (
    <AccountPageSection>
      <OrganizationAccountSections />
    </AccountPageSection>
  )
}

export default AuthAccountOrganizationView
