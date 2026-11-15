/**
 * Sign-in layout tokens — keep dynamic-import skeletons aligned with live UI.
 * @see `Button` default size in `@packages/ui/components/button`
 * @see `Input` `size="lg"` in `@packages/ui/components/input`
 * @see `AuthMagicLinkEmailInput` / `AuthMagicLinkForm`
 */
export const authSignInLayout = {
  /** `Button` default: `h-9 … sm:h-8`, `rounded-lg` */
  outlineButtonSkeleton: "h-9 w-full rounded-lg sm:h-8" satisfies string,
  magicLink: {
    form: "flex flex-col gap-3",
    /** `Field` with `gap-1.5` override (default is `gap-2`) */
    field: "flex w-full flex-col items-stretch gap-1.5",
    /** `text-sm` label line (e.g. “Email”) */
    labelSkeleton: "h-5 w-11 rounded-sm",
    /** `Input` control wrapper, `size="lg"` */
    inputSkeleton: "h-9.5 w-full rounded-lg sm:h-8.5",
    submitSkeleton: "h-9 w-full rounded-lg sm:h-8",
  },
  socialStack: "flex flex-col gap-2",
} as const
