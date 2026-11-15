import { AccountPageSection } from "@/shared/shell/account-page-section"
import { SecurityAccountSections } from "@/shared/shell/account-section-frames"

export function AuthAccountSecurityView() {
  return (
    <AccountPageSection>
      <SecurityAccountSections />
    </AccountPageSection>
  )
}

export default AuthAccountSecurityView
