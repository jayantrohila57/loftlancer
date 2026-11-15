import { AccountHubSections } from "@/shared/shell/account-hub-frames"
import { AccountPageSection } from "@/shared/shell/account-page-section"

export function AuthAccountHubView() {
  return (
    <AccountPageSection>
      <AccountHubSections />
    </AccountPageSection>
  )
}

export default AuthAccountHubView
