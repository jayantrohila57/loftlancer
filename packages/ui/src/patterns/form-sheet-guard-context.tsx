"use client";

import { createContext, type ReactNode, useContext } from "react";

type FormSheetGuardContextValue = {
  allowNextCloseWithoutPrompt: () => void;
  requestClose: () => void;
};

const FormSheetGuardContext = createContext<FormSheetGuardContextValue | null>(
  null,
);

export function FormSheetGuardProvider({
  allowNextCloseWithoutPrompt,
  requestClose,
  children,
}: {
  allowNextCloseWithoutPrompt: () => void;
  requestClose: () => void;
  children: ReactNode;
}) {
  return (
    <FormSheetGuardContext.Provider
      value={{ allowNextCloseWithoutPrompt, requestClose }}
    >
      {children}
    </FormSheetGuardContext.Provider>
  );
}

export function useFormSheetCloseWithoutPrompt(): () => void {
  const ctx = useContext(FormSheetGuardContext);
  return ctx?.allowNextCloseWithoutPrompt ?? (() => {});
}

export function useFormSheetRequestClose(): () => void {
  const ctx = useContext(FormSheetGuardContext);
  return ctx?.requestClose ?? (() => {});
}
