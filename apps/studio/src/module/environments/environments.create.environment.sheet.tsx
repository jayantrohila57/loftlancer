"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createEnvironmentInput } from "@loftlancer/api/validation";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import {
  SheetClose,
  SheetDescription,
  SheetTrigger,
} from "@loftlancer/ui/sheet";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v3";
import {
  PageHeaderActionLabel,
  pageHeaderActionButtonClassName,
} from "@/components/layout/page-header-action-button";
import { AppIcon } from "@/components/patterns/app-icon";
import { FormField } from "@/components/patterns/form-field";
import {
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { GuardedSheet } from "@/components/patterns/guarded-sheet";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";

const environmentNameSchema = createEnvironmentInput.pick({ name: true });

interface CreateEnvironmentSheetProps {
  onConfirm: (name: string) => Promise<void>;
  isPending: boolean;
  triggerText?: string;
  /** Icon-only trigger below `sm` with accessible label. */
  compactOnMobile?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function CreateEnvironmentSheet({
  onConfirm,
  isPending,
  triggerText = "Create Environment",
  compactOnMobile = false,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: CreateEnvironmentSheetProps) {
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;
  const isAddAction = triggerText.toLowerCase().startsWith("add");

  const form = useForm({
    resolver: zodResolver(environmentNameSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: z.infer<typeof environmentNameSchema>) => {
    try {
      await onConfirm(data.name.trim());
      form.reset();
      closeWithoutPromptRef.current?.();
      setOpen(false);
    } catch {
      // Toast + dialog stay open on failure.
    }
  };

  return (
    <GuardedSheet
      open={open}
      onOpenChange={setOpen}
      isDirty={form.formState.isDirty}
      onDiscard={() => form.reset()}
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
      {hideTrigger ? null : (
        <SheetTrigger
          render={
            <Button
              variant={isAddAction ? "outline" : "default"}
              size="sm"
              className={pageHeaderActionButtonClassName(
                compactOnMobile ? undefined : "gap-1.5",
                compactOnMobile,
              )}
            />
          }
        >
          <AppIcon name="plus" className="text-current" />
          {compactOnMobile ? (
            <PageHeaderActionLabel>{triggerText}</PageHeaderActionLabel>
          ) : (
            triggerText
          )}
        </SheetTrigger>
      )}
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="environment">
            Create Environment
          </SheetTitleWithIcon>
          <SheetDescription>
            Add a new environment (e.g., development, staging, production).
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={form.handleSubmit(onSubmit)}>
          <FormSheetBody>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  id="env-name"
                  label="Name"
                  required
                  error={fieldState.error?.message}
                >
                  <Input
                    {...field}
                    id="env-name"
                    placeholder="development"
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                </FormField>
              )}
            />
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose
              render={
                <Button variant="ghost" type="button" disabled={isPending} />
              }
            >
              Cancel
            </SheetClose>
            <SubmitButton isLoading={isPending} loadingLabel="Creating…">
              Create
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </GuardedSheet>
  );
}
