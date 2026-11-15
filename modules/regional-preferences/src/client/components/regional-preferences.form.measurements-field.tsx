"use client"

import type { FieldOption } from "@features/form"
import { FormKit } from "@features/form"
import type { ReactNode } from "react"

export function RegionalMeasurementField({
  description,
  label,
  options,
}: {
  readonly description?: ReactNode
  readonly label: ReactNode
  readonly options: FieldOption[]
}) {
  return (
    <div className="[&_[data-slot=radio-group]]:grid [&_[data-slot=radio-group]]:gap-3 [&_[data-slot=radio-group]]:sm:grid-cols-2 [&_[data-slot=radio-group]>*:first-child]:sm:col-span-2">
      <FormKit.Field
        type="radio-group"
        card
        name="value"
        label={label}
        description={description}
        options={options}
      />
    </div>
  )
}
