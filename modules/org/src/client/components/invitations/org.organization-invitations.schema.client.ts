import type { useTranslations } from "next-intl"
import { z } from "zod"

type Translate = ReturnType<typeof useTranslations<"ui">>

export function createOrganizationInviteFormSchema(t: Translate) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t("organizationInviteEmailRequired"))
      .email(t("organizationInviteEmailInvalid")),
    role: z.enum(["member", "manager"]),
  })
}

export type OrganizationInviteFormValues = z.infer<
  ReturnType<typeof createOrganizationInviteFormSchema>
>
