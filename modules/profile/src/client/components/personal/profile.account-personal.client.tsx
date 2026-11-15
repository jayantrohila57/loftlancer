"use client"

import { FormKit } from "@features/form"
import { AuthSessionEndedNotice } from "@modules/auth"
import { authClient } from "@packages/better-auth/client"
import { Badge } from "@packages/ui/components/badge"
import { Button } from "@packages/ui/components/button"
import { toastManager } from "@packages/ui/components/toast"
import { InfoIcon } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"
import { api } from "../../hooks/profile.api"
import { useProfileClientMounted } from "../../hooks/profile.client-mounted.client"
import { profileAccountProfileLayout } from "../profile.account-profile-layout"
import { ProfileAccountPersonalSkeleton } from "../profile.account-profile-skeleton"
import type { ProfilePersonalFormValues } from "./profile.account-personal.schema.client"
import { createProfilePersonalFormSchema } from "./profile.account-personal.schema.client"

export function ProfileAccountPersonal() {
  const t = useTranslations("ui")
  const profileSchema = createProfilePersonalFormSchema(t)

  const format = useFormatter()
  const mounted = useProfileClientMounted()
  const updateProfile = api.profile.useUpdateProfile()
  const { data, isPending, error, refetch } = authClient.useSession()
  const [editingPersonal, setEditingPersonal] = useState(false)

  async function save({ name }: ProfilePersonalFormValues) {
    try {
      await toastManager.promise(
        (async () => {
          await updateProfile.mutateAsync({ name })
          setEditingPersonal(false)
        })(),
        {
          loading: t("savingProfile"),
          success: t("profileUpdated"),
          error: t("couldNotUpdateYourName"),
        }
      )
    } catch {
      // The toast reports the failure and the form remains editable.
    }
  }

  const { personal: personalLayout } = profileAccountProfileLayout

  if (!mounted || isPending) {
    return <ProfileAccountPersonalSkeleton />
  }

  if (error) {
    return (
      <div className={personalLayout.panelShell}>
        <p className="text-sm text-muted-foreground">
          {t("unableToLoadYourProfile")}{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            {t("tryAgain")}
          </button>
        </p>
      </div>
    )
  }

  if (!data?.user) {
    return (
      <div className={personalLayout.panelShell}>
        <AuthSessionEndedNotice />
      </div>
    )
  }

  return (
    <div className={personalLayout.panelShell}>
      <FormKit
        variant="embedded"
        key={`${data.user.id}:${data.user.name}:${data.user.email}:${editingPersonal}`}
        schema={profileSchema}
        defaultValues={{ name: data.user.name, email: data.user.email }}
        onSubmit={save}
      >
        <FormKit.Section
          title={t("name")}
          description={t("thisNameAppearsOnYourAccount")}
        >
          <FormKit.Field
            type="text"
            name="name"
            label={t("displayName")}
            required
            readOnly={!editingPersonal}
          />
        </FormKit.Section>
        <FormKit.Section
          title={t("email")}
          description={t("yourAccountEmailAddress")}
        >
          <FormKit.Field
            type="email"
            name="email"
            label={
              <span className="inline-flex items-center gap-2">
                {t("emailAddress")}{" "}
                <Badge
                  variant={data.user.emailVerified ? "success" : "secondary"}
                >
                  {data.user.emailVerified ? t("verified") : t("notVerified")}
                </Badge>
              </span>
            }
            readOnly
          />
        </FormKit.Section>
        <FormKit.Actions>
          {editingPersonal ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingPersonal(false)}
              >
                {t("cancel")}
              </Button>
              <FormKit.Submit />
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingPersonal(true)}
            >
              {t("edit")}
            </Button>
          )}
        </FormKit.Actions>
      </FormKit>
      <div
        className={`${personalLayout.memberAlertSlot} rounded-lg bg-muted/50 p-3 text-sm`}
        role="note"
      >
        <div className="flex items-center gap-2 font-medium">
          <InfoIcon className="size-4" aria-hidden="true" />
          {t("accountMembership")}
        </div>
        <p className="mt-1 text-muted-foreground">
          {t("memberSinceDate", {
            date: format.dateTime(new Date(data.user.createdAt), "longDate"),
          })}
        </p>
      </div>
    </div>
  )
}
