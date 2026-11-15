import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { ProfileAccountAvatar } from "./avatar/profile.account-avatar.client"
import { ProfileAccountPersonal } from "./personal/profile.account-personal.client"

export function ProfileAccountView() {
  const t = useTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.avatar"
          description={t("uploadAFileOrPasteAnHTTPSImageLink")}
          title={t("profilePicture")}
        >
          <ProfileAccountAvatar />
        </ShellAccountFrameSection>
        <ShellAccountFrameSection
          activityTarget="account.profile"
          description={t("updateYourNameAndHowOthersSeeYou")}
          title={t("personalInformation")}
        >
          <ProfileAccountPersonal />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
