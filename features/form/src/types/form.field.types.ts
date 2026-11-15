import type { ReactNode } from "react"
import type { FieldValues, Path } from "react-hook-form"

export type FieldOption = {
  value: string
  label: ReactNode
  disabled?: boolean
  description?: ReactNode
}

export type SelectOptionGroup = { label: string; options: FieldOption[] }

/** State of options fetched by the consuming application. */
type OptionsStateProps = { optionsError?: string }

export type FieldBaseProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = {
  name: TName
  label?: ReactNode
  description?: ReactNode
  placeholder?: string
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  readOnly?: boolean
  loading?: boolean
}
export type TextFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & {
  type: "text" | "email" | "tel" | "url" | "search" | "password" | "avatar-url"
  inputType?: "text" | "email" | "password" | "tel" | "url" | "search"
  showStrength?: boolean
}
export type AvatarUploadFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & {
  type: "avatar-upload"
  upload: (file: File) => Promise<string>
  /** `profile` — large preview with heading, hint, and explicit upload actions. */
  layout?: "inline" | "profile"
  heading?: ReactNode
  afterUpload?: (url: string) => void | Promise<void>
  afterClear?: () => void | Promise<void>
}
export type NumberInputFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & {
  type: "number" | "currency"
  min?: number
  max?: number
  step?: number
  currency?: string
  precision?: number
}
export type SelectFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "select"
    options: FieldOption[]
    size?: "sm" | "default" | "lg"
    alignItemWithTrigger?: boolean
  }
export type GroupedSelectFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "select-group"
    groups: SelectOptionGroup[]
  }
export type MultipleSelectFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "select-multiple"
    options: FieldOption[]
  }
export type RichSelectOption = {
  value: string
  label: string
  icon?: ReactNode
  description?: ReactNode
  disabled?: boolean
}
export type RichSelectFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "select-rich"
    options: RichSelectOption[]
    prefix?: string
    icon?: ReactNode
    pill?: boolean
    autoWidth?: boolean
  }
export type ObjectSelectOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
} & Record<string, unknown>
export type ObjectSelectFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "select-object"
    options: ObjectSelectOption[]
  }
export type TimezoneSelectFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & { type: "select-timezone" }
export type ComboboxOption = {
  value: string
  label: string
  disabled?: boolean
}
export type ComboboxFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "combobox"
    options: ComboboxOption[]
    showClear?: boolean
    size?: "sm" | "default" | "lg"
  }
export type MultipleComboboxFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "combobox-multiple"
    options: ComboboxOption[]
  }
export type AutocompleteFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "autocomplete"
    options: ComboboxOption[]
    size?: "sm" | "default" | "lg"
    showClear?: boolean
    showTrigger?: boolean
    autoHighlight?: boolean
  }
export type CheckboxFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & { type: "checkbox"; card?: boolean }
export type CheckboxGroupFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "checkbox-group"
    options: FieldOption[]
    selectAllLabel?: string
  }
export type SwitchFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & { type: "switch"; card?: boolean }
export type SliderFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & {
  type: "slider" | "slider-range"
  min?: number
  max?: number
  step?: number
}
export type ToggleFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & { type: "toggle" }
export type ToggleGroupFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "toggle-group"
    options: FieldOption[]
  }
export type SegmentedFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "segmented"
    options: FieldOption[]
  }
export type DateFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & { type: "date" }
export type RadioGroupFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> &
  OptionsStateProps & {
    type: "radio-group"
    options: FieldOption[]
    card?: boolean
  }
export type TextareaFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & { type: "textarea"; maxLength?: number }

export type { AppearancePreviewId } from "../capability/fields/appearance/appearance-preview-svgs.generated"

/** Inline SVG id (uses global `--ap-*` tokens under `.appearance-preview`). */
export type AppearancePreviewSrc =
  import("../capability/fields/appearance/appearance-preview-svgs.generated").AppearancePreviewId

export type ThemeFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & {
  type: "theme"
  /** Hides the field legend; use when the parent section supplies the title. */
  panel?: boolean
  /** Inline SVG preview ids keyed by theme value. */
  previewAssets?: Partial<
    Record<"dark" | "light" | "system", AppearancePreviewSrc>
  >
}

export type AppearanceScalePreviewBucket = {
  id: "dense" | "default" | "spacious"
  imageAlt?: string
  imageSrc?: AppearancePreviewSrc
  label: string
  values: string[]
}
export type AppearanceScaleFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & {
  type: "appearance-scale"
  /** When `"slider"`, shows a ranged control; otherwise shows step radios. */
  control?: "slider" | "steps"
  previewBuckets?: readonly AppearanceScalePreviewBucket[]
  sliderMax?: number
  sliderMin?: number
  sliderStep?: number
  steps: readonly { label: string; value: string }[]
}
export type VisualRadioOption = {
  disabled?: boolean
  label: ReactNode
  preview: ReactNode
  value: string
}
export type VisualRadioFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & {
  type: "visual-radio"
  options: readonly VisualRadioOption[]
}
export type OtpFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & {
  type: "otp"
  length?: number
  size?: "default" | "lg"
  separator?: boolean
  mask?: boolean
  validationType?: "numeric" | "alphanumeric" | "none"
  normalizeValue?: (value: string) => string
  validateOnComplete?: boolean
}
export type AddressMapFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> = FieldBaseProps<TValues, TName> & {
  type: "address-map"
  workerUrl: string
  defaultCenter?: [number, number]
  defaultZoom?: number
}
export type FormFieldProps<
  TValues extends FieldValues = FieldValues,
  TName extends Path<TValues> = Path<TValues>,
> =
  | TextFieldProps<TValues, TName>
  | AvatarUploadFieldProps<TValues, TName>
  | NumberInputFieldProps<TValues, TName>
  | SelectFieldProps<TValues, TName>
  | GroupedSelectFieldProps<TValues, TName>
  | MultipleSelectFieldProps<TValues, TName>
  | RichSelectFieldProps<TValues, TName>
  | ObjectSelectFieldProps<TValues, TName>
  | TimezoneSelectFieldProps<TValues, TName>
  | ComboboxFieldProps<TValues, TName>
  | MultipleComboboxFieldProps<TValues, TName>
  | AutocompleteFieldProps<TValues, TName>
  | CheckboxFieldProps<TValues, TName>
  | CheckboxGroupFieldProps<TValues, TName>
  | RadioGroupFieldProps<TValues, TName>
  | SwitchFieldProps<TValues, TName>
  | SliderFieldProps<TValues, TName>
  | ToggleFieldProps<TValues, TName>
  | ToggleGroupFieldProps<TValues, TName>
  | SegmentedFieldProps<TValues, TName>
  | DateFieldProps<TValues, TName>
  | TextareaFieldProps<TValues, TName>
  | ThemeFieldProps<TValues, TName>
  | AppearanceScaleFieldProps<TValues, TName>
  | VisualRadioFieldProps<TValues, TName>
  | OtpFieldProps<TValues, TName>
  | AddressMapFieldProps<TValues, TName>
export type FieldType = FormFieldProps["type"]
export type ServerFieldError = { path: string; message: string }
export type MapServerErrorResult =
  | ServerFieldError[]
  | { form?: string; fields?: ServerFieldError[] }
