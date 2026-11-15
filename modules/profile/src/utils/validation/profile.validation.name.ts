import { z } from "zod"

import { PROFILE_DISPLAY_NAME_MAX_LENGTH } from "../constants/profile.constants.name"

export const profileDisplayNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(PROFILE_DISPLAY_NAME_MAX_LENGTH)
