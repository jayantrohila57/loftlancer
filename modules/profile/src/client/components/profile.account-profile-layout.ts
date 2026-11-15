/**
 * Profile account layout tokens — keep dynamic-import skeletons aligned with live UI.
 * @see `FormKit` `variant="embedded"` and `FormKit.Section` in `@features/form`
 * @see `ProfileAccountAvatar` / `ProfileAccountPersonal` embedded forms
 */
export const profileAccountProfileLayout = {
  /** `FormKit` embedded root: `flex min-h-0 w-full flex-col gap-4` */
  embeddedForm: "flex min-h-0 w-full flex-col gap-4",
  /** Scroll body inside embedded form: `min-h-0 flex-1 overflow-y-auto` */
  embeddedScrollBody: "min-h-0 flex-1 overflow-y-auto",
  /** Scroll body wrapper contents: `flex flex-col gap-4` */
  embeddedBody: "flex flex-col gap-4",
  /** `FormKit.Section` */
  section:
    "grid w-full grid-cols-6 gap-4 border-b pb-6 last:border-b-0 last:pb-0",
  sectionAside: "col-span-2 w-full space-y-1",
  /** `text-base font-semibold` title line */
  sectionTitle: "h-6 w-20 rounded-sm",
  /** `text-sm text-muted-foreground` description line */
  sectionDescription: "h-4 w-44 max-w-full rounded-sm",
  sectionContent: "col-span-4 w-full",
  /** `FormKit.Actions` after embedded `[&_[data-slot=form-kit-actions]]:p-0` */
  actions: "flex shrink-0 flex-wrap items-center justify-end gap-2 p-0",
  /** `Button` default size */
  actionButton: "h-9 w-14 rounded-lg sm:h-8",
  avatar: {
    /** Stable `FramePanel` height for skeleton → embedded `FormKit` */
    panelShell: "w-full min-h-[11.5rem]",
    profileRow: "flex w-full flex-col gap-4 sm:flex-row sm:items-start",
    profilePreview: "size-24 shrink-0 rounded-full",
    profileBody: "flex min-w-0 flex-1 flex-col gap-3",
    profileHeading: "h-6 w-36 rounded-sm",
    profileHint: "h-4 w-full max-w-md rounded-sm",
    profileActions: "flex flex-wrap items-center gap-2",
    profileUploadButton: "h-8 w-24 rounded-lg",
  },
  personal: {
    /** Stable `FramePanel` height for skeleton → form + member alert */
    panelShell: "flex w-full min-h-[19.5rem] flex-col",
    field: "flex w-full flex-col items-start gap-2",
    nameLabel: "h-5 w-28 rounded-sm",
    /** Email label includes inline `Badge` */
    emailLabel: "h-5 w-44 rounded-sm",
    input: "h-9 w-full rounded-lg sm:h-8",
    /** Reserved slot for the membership information card. */
    memberAlertSlot: "mt-4 min-h-16 w-full",
    memberAlert: "h-16 w-full rounded-lg",
  },
} as const
