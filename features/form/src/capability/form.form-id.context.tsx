"use client"

import { createContext, useContext } from "react"

const FormKitFormIdContext = createContext<string | undefined>(undefined)

export function FormKitFormIdProvider({
  formId,
  children,
}: {
  readonly formId: string
  readonly children: React.ReactNode
}) {
  return (
    <FormKitFormIdContext.Provider value={formId}>
      {children}
    </FormKitFormIdContext.Provider>
  )
}

/** HTML `form` id for submit controls rendered outside the `<form>` node (e.g. a portal). */
export function useFormKitFormId() {
  return useContext(FormKitFormIdContext)
}
