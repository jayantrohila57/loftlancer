/** Shared React Hook Form behavior for each kit. */
export const formValidationDefaults = {
  mode: "onSubmit",
  reValidateMode: "onChange",
  criteriaMode: "all",
  shouldFocusError: true,
} as const

export const fieldValidationDefaults = {
  mode: "onChange",
  reValidateMode: "onChange",
  shouldFocusError: true,
} as const
