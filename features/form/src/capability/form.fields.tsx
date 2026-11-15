"use client"

import type { ComponentType, LazyExoticComponent } from "react"
import { lazy, Suspense } from "react"
import type { FieldValues, Path } from "react-hook-form"
import type { FieldType, FormFieldProps } from "../types/form.field.types"

type FieldComponent = ComponentType<FormFieldProps>

function lazyField(
  load: () => Promise<{ default: FieldComponent }>
): LazyExoticComponent<FieldComponent> {
  return lazy(load)
}

const fields: Record<FieldType, LazyExoticComponent<FieldComponent>> = {
  "avatar-upload": lazyField(() =>
    import("./fields/avatar/form.field.avatar-upload").then((module) => ({
      default: module.FieldAvatarUpload as FieldComponent,
    }))
  ),
  "avatar-url": lazyField(() =>
    import("./fields/input/form.field.input-text").then((module) => ({
      default: module.FieldText as FieldComponent,
    }))
  ),
  text: lazyField(() =>
    import("./fields/input/form.field.input-text").then((module) => ({
      default: module.FieldText as FieldComponent,
    }))
  ),
  email: lazyField(() =>
    import("./fields/input/form.field.input-email").then((module) => ({
      default: module.FieldEmail as FieldComponent,
    }))
  ),
  tel: lazyField(() =>
    import("./fields/input/form.field.input-tel").then((module) => ({
      default: module.FieldTel as FieldComponent,
    }))
  ),
  url: lazyField(() =>
    import("./fields/input/form.field.input-url").then((module) => ({
      default: module.FieldUrl as FieldComponent,
    }))
  ),
  search: lazyField(() =>
    import("./fields/input/form.field.input-search").then((module) => ({
      default: module.FieldSearch as FieldComponent,
    }))
  ),
  password: lazyField(() =>
    import("./fields/input/form.field.input-password").then((module) => ({
      default: module.FieldPassword as FieldComponent,
    }))
  ),
  number: lazyField(() =>
    import("./fields/input/form.field.input-number").then((module) => ({
      default: module.FieldNumber as FieldComponent,
    }))
  ),
  currency: lazyField(() =>
    import("./fields/input/form.field.input-currency").then((module) => ({
      default: module.FieldCurrency as FieldComponent,
    }))
  ),
  autocomplete: lazyField(() =>
    import("./fields/autocomplete/form.field.autocomplete").then((module) => ({
      default: module.FieldAutocomplete as FieldComponent,
    }))
  ),
  "combobox-multiple": lazyField(() =>
    import("./fields/combobox/form.field.combobox-multiple").then((module) => ({
      default: module.FieldComboboxMultiple as FieldComponent,
    }))
  ),
  combobox: lazyField(() =>
    import("./fields/combobox/form.field.combobox").then((module) => ({
      default: module.FieldCombobox as FieldComponent,
    }))
  ),
  "select-object": lazyField(() =>
    import("./fields/select/form.field.select-object").then((module) => ({
      default: module.FieldSelectObject as FieldComponent,
    }))
  ),
  "select-timezone": lazyField(() =>
    import("./fields/select/form.field.select-timezone").then((module) => ({
      default: module.FieldSelectTimezone as FieldComponent,
    }))
  ),
  "select-rich": lazyField(() =>
    import("./fields/select/form.field.select-rich").then((module) => ({
      default: module.FieldSelectRich as FieldComponent,
    }))
  ),
  "select-group": lazyField(() =>
    import("./fields/select/form.field.select-group").then((module) => ({
      default: module.FieldSelectGroup as FieldComponent,
    }))
  ),
  "select-multiple": lazyField(() =>
    import("./fields/select/form.field.select-multiple").then((module) => ({
      default: module.FieldSelectMultiple as FieldComponent,
    }))
  ),
  select: lazyField(() =>
    import("./fields/select/form.field.select").then((module) => ({
      default: module.FieldSelect as FieldComponent,
    }))
  ),
  toggle: lazyField(() =>
    import("./fields/toggle/form.field.toggle").then((module) => ({
      default: module.FieldToggle as FieldComponent,
    }))
  ),
  "toggle-group": lazyField(() =>
    import("./fields/toggle/form.field.toggle-group").then((module) => ({
      default: module.FieldToggleGroup as FieldComponent,
    }))
  ),
  segmented: lazyField(() =>
    import("./fields/segmented/form.field.segmented").then((module) => ({
      default: module.FieldSegmented as FieldComponent,
    }))
  ),
  date: lazyField(() =>
    import("./fields/date/form.field.date").then((module) => ({
      default: module.FieldDate as FieldComponent,
    }))
  ),
  switch: lazyField(() =>
    import("./fields/switch/form.field.switch").then((module) => ({
      default: module.FieldSwitch as FieldComponent,
    }))
  ),
  slider: lazyField(() =>
    import("./fields/slider/form.field.slider").then((module) => ({
      default: module.FieldSlider as FieldComponent,
    }))
  ),
  "slider-range": lazyField(() =>
    import("./fields/slider/form.field.slider").then((module) => ({
      default: module.FieldSlider as FieldComponent,
    }))
  ),
  "radio-group": lazyField(() =>
    import("./fields/radio/form.field.radio-group").then((module) => ({
      default: module.FieldRadioGroup as FieldComponent,
    }))
  ),
  checkbox: lazyField(() =>
    import("./fields/checkbox/form.field.checkbox").then((module) => ({
      default: module.FieldCheckbox as FieldComponent,
    }))
  ),
  "checkbox-group": lazyField(() =>
    import("./fields/checkbox/form.field.checkbox-group").then((module) => ({
      default: module.FieldCheckboxGroup as FieldComponent,
    }))
  ),
  otp: lazyField(() =>
    import("./fields/otp/form.field.otp").then((module) => ({
      default: module.FieldOtp as FieldComponent,
    }))
  ),
  theme: lazyField(() =>
    import("./fields/radio/form.field.theme").then((module) => ({
      default: module.FieldTheme as FieldComponent,
    }))
  ),
  "appearance-scale": lazyField(() =>
    import("./fields/appearance/form.field.appearance-scale").then(
      (module) => ({
        default: module.FieldAppearanceScale as FieldComponent,
      })
    )
  ),
  "visual-radio": lazyField(() =>
    import("./fields/appearance/form.field.visual-radio").then((module) => ({
      default: module.FieldVisualRadio as FieldComponent,
    }))
  ),
  textarea: lazyField(() =>
    import("./fields/textarea/form.field.textarea").then((module) => ({
      default: module.FieldTextarea as FieldComponent,
    }))
  ),
  "address-map": lazyField(() =>
    import("./fields/map/form.field.address-map").then((module) => ({
      default: module.FieldAddressMap as FieldComponent,
    }))
  ),
}

/** Loads only the field module for `type`; other field chunks stay unloaded. */
export function FormField<
  TValues extends FieldValues,
  TName extends Path<TValues>,
>(props: FormFieldProps<TValues, TName>) {
  if (props.hidden) return null

  const Field = fields[props.type]

  return (
    <Suspense fallback={null}>
      <Field {...props} />
    </Suspense>
  )
}
