/** Fixed copy and defaults shared across form controls. */
export const FORM_MESSAGES = {
  emptyOptions: "No items found.",
  submit: "Submit",
  submitting: "Submitting…",
  reset: "Reset",
  unexpectedError: "Something went wrong. Please try again.",
} as const

export const PHONE_CALLING_CODES = [
  "+1",
  "+44",
  "+61",
  "+64",
  "+49",
  "+33",
  "+81",
  "+86",
  "+91",
  "+971",
] as const

/** ISO 3166-1 alpha-2 → calling code for {@link PHONE_CALLING_CODES}. */
const PHONE_CALLING_CODE_BY_REGION: Partial<
  Record<string, (typeof PHONE_CALLING_CODES)[number]>
> = {
  US: "+1",
  CA: "+1",
  GB: "+44",
  AU: "+61",
  NZ: "+64",
  DE: "+49",
  FR: "+33",
  JP: "+81",
  CN: "+86",
  IN: "+91",
  AE: "+971",
}

export function callingCodeForRegion(regionCode: string | null | undefined) {
  if (!regionCode) return ""
  const normalized = regionCode.trim().toUpperCase()
  return PHONE_CALLING_CODE_BY_REGION[normalized] ?? ""
}
