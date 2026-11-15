import { Skeleton } from "@packages/ui/components/skeleton"

import { profileAccountProfileLayout } from "./profile.account-profile-layout"

/** Placeholder for `ProfileAccountAvatar` embedded `FormKit` (view / edit=false). */
export function ProfileAccountAvatarSkeleton() {
  const layout = profileAccountProfileLayout
  const { avatar } = layout

  return (
    <div className={avatar.panelShell}>
      <div aria-hidden className={layout.embeddedForm}>
        <div className={layout.embeddedScrollBody}>
          <div className={layout.embeddedBody}>
            <div className={avatar.profileRow}>
              <Skeleton className={avatar.profilePreview} />
              <div className={avatar.profileBody}>
                <Skeleton className={avatar.profileHeading} />
                <Skeleton className={avatar.profileHint} />
                <div className={avatar.profileActions}>
                  <Skeleton className={avatar.profileUploadButton} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={layout.actions} data-slot="form-kit-actions">
          <Skeleton className={layout.actionButton} />
        </div>
      </div>
    </div>
  )
}

/** Placeholder for `ProfileAccountPersonal` embedded `FormKit` + member alert. */
export function ProfileAccountPersonalSkeleton() {
  const layout = profileAccountProfileLayout
  const { personal } = layout

  return (
    <div className={personal.panelShell}>
      <div aria-hidden className={layout.embeddedForm}>
        <div className={layout.embeddedScrollBody}>
          <div className={layout.embeddedBody}>
            <section className={layout.section}>
              <div className={layout.sectionAside}>
                <Skeleton className={layout.sectionTitle} />
                <Skeleton className={layout.sectionDescription} />
              </div>
              <div className={layout.sectionContent}>
                <div className={personal.field}>
                  <Skeleton className={personal.nameLabel} />
                  <Skeleton className={personal.input} />
                </div>
              </div>
            </section>
            <section className={layout.section}>
              <div className={layout.sectionAside}>
                <Skeleton className={layout.sectionTitle} />
                <Skeleton className={layout.sectionDescription} />
              </div>
              <div className={layout.sectionContent}>
                <div className={personal.field}>
                  <Skeleton className={personal.emailLabel} />
                  <Skeleton className={personal.input} />
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className={layout.actions} data-slot="form-kit-actions">
          <Skeleton className={layout.actionButton} />
        </div>
      </div>
      <div className={personal.memberAlertSlot} aria-hidden>
        <Skeleton className={personal.memberAlert} />
      </div>
    </div>
  )
}
