import { z } from "zod/v3";

export const organizationBrandingLogoSchema = z
  .string()
  .url()
  .max(2048)
  .refine((value) => {
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Logo URL must use HTTPS.")
  .nullable();
