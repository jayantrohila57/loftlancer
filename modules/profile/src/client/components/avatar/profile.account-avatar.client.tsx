"use client"

import { FormKit } from "@features/form"
import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import { toastManager } from "@packages/ui/components/toast"
import { useTranslations } from "next-intl"
import { useState } from "react"
import type { AvatarFormInput } from "../../../utils/types/profile.types.avatar"
import { avatarFormSchema } from "../../../utils/validation/profile.validation.avatar"

import { api } from "../../hooks/profile.api"
import { useProfileClientMounted } from "../../hooks/profile.client-mounted.client"
import { profileAccountProfileLayout } from "../profile.account-profile-layout"
import { ProfileAccountAvatarSkeleton } from "../profile.account-profile-skeleton"

function verifyImage(url: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image()
    const timer = window.setTimeout(() => {
      image.src = ""
      reject(new Error("Image could not be loaded."))
    }, 10000)
    image.onload = () => {
      window.clearTimeout(timer)
      resolve()
    }
    image.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error("Image could not be loaded."))
    }
    image.src = url
  })
}

async function persistAvatar(
  image: string | null,
  updateProfile: ReturnType<typeof api.profile.useUpdateProfile>
) {
  await updateProfile.mutateAsync({ image })
}

export function ProfileAccountAvatar() {
  const t = useTranslations("ui")

  const mounted = useProfileClientMounted()
  const updateProfile = api.profile.useUpdateProfile()
  const uploadAvatar = api.profile.useUploadAvatar()
  const { data, isPending } = authClient.useSession()
  const [editingUrl, setEditingUrl] = useState(false)
  const [avatarEpoch, setAvatarEpoch] = useState(0)

  async function saveAvatar({ image }: AvatarFormInput) {
    const wasEditingUrl = editingUrl
    try {
      await toastManager.promise(
        (async () => {
          if (image) await verifyImage(image)
          await persistAvatar(image || null, updateProfile)
          setEditingUrl(false)
        })(),
        {
          loading: t("savingAvatar"),
          success: t("avatarUpdated"),
          error: t("couldNotUpdateYourAvatar"),
        }
      )
    } catch {
      if (wasEditingUrl) setEditingUrl(true)
    }
  }

  const { avatar: avatarLayout } = profileAccountProfileLayout

  if (!mounted || isPending || !data?.user) {
    return <ProfileAccountAvatarSkeleton />
  }

  return (
    <div className={avatarLayout.panelShell}>
      <FormKit
        variant="embedded"
        key={`${data.user.id}:${data.user.image ?? ""}:${editingUrl}:${avatarEpoch}`}
        schema={avatarFormSchema}
        defaultValues={{ image: data.user.image ?? "" }}
        onSubmit={saveAvatar}
      >
        <FormKit.Field
          type="avatar-upload"
          layout="profile"
          name="image"
          heading={t("profilePicture")}
          description={t("pNGJPEGWebPAndGIFUpTo5MB")}
          upload={uploadAvatar.mutateAsync}
          afterUpload={async (url) => {
            try {
              await toastManager.promise(persistAvatar(url, updateProfile), {
                loading: t("savingAvatar"),
                success: t("avatarUpdated"),
                error: t("couldNotUpdateYourAvatar"),
              })
            } catch {
              setAvatarEpoch((value) => value + 1)
            }
          }}
          afterClear={() =>
            toastManager.promise(persistAvatar(null, updateProfile), {
              loading: t("removingAvatar"),
              success: t("avatarRemoved"),
              error: t("couldNotRemoveYourAvatar"),
            })
          }
        />
        {editingUrl ? (
          <div className="space-y-4 border-t pt-4">
            <FormKit.Field
              type="avatar-url"
              name="image"
              label={t("imageURL")}
              description={t("pasteADirectHTTPSLinkToAnImageFile")}
            />
          </div>
        ) : null}
        <FormKit.Actions>
          {editingUrl ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUrl(false)}
              >
                {t("cancel")}
              </Button>
              <FormKit.Submit />
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingUrl(true)}
            >
              {t("useImageURL")}
            </Button>
          )}
        </FormKit.Actions>
      </FormKit>
    </div>
  )
}
