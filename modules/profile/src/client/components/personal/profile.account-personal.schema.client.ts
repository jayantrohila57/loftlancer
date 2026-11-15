import type { useTranslations } from "next-intl"
import { z } from "zod"

import { PROFILE_DISPLAY_NAME_MAX_LENGTH } from "../../../utils/constants/profile.constants.name"

type UiT = ReturnType<typeof useTranslations<"ui">>

/** Client FormKit schema with translated validation messages. */
export function createProfilePersonalFormSchema(t: UiT) {
  return z.object({
    email: z.string(),
    name: z
      .string()
      .trim()
      .min(1, t("enterName"))
      .max(
        PROFILE_DISPLAY_NAME_MAX_LENGTH,
        t("nameLength", { max: PROFILE_DISPLAY_NAME_MAX_LENGTH })
      ),
  })
}

export type ProfilePersonalFormValues = z.infer<
  ReturnType<typeof createProfilePersonalFormSchema>
>
