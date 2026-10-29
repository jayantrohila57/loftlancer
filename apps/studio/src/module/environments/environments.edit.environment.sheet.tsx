"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { SheetClose, SheetDescription } from "@loftlancer/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@loftlancer/ui/tooltip";
import { useEffect, useMemo, useRef, useState } from "react";
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
import type { ProvenanceUser } from "@/components/patterns/provenance-attribution";
import { ProvenanceDetail } from "@/components/patterns/provenance-attribution";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { isVariablesV2EnabledOnClient } from "@/lib/variables-v2-enabled";

interface Environment {
  id: string;
  name: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: ProvenanceUser | null;
  updatedBy?: ProvenanceUser | null;
}

interface EditEnvironmentSheetProps {
  environment: Environment;
  onConfirm: (id: string, name: string) => Promise<void>;
  isPending: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function EditEnvironmentSheet({
  environment,
  onConfirm,
  isPending,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  hideTrigger = false,
}: EditEnvironmentSheetProps) {
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;
  const [name, setName] = useState(environment.name);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(environment.name);
  }, [environment.name]);

  useEffect(() => {
    if (open) {
      setName(environment.name);
      setError(null);
    }
  }, [open, environment.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Environment name is required");
      return;
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9 _-]*$/.test(trimmed)) {
      setError("Use letters, numbers, spaces, hyphens, and underscores only.");
      return;
    }
    setError(null);
    try {
      await onConfirm(environment.id, trimmed);
      closeWithoutPromptRef.current?.();
      setOpen(false);
    } catch {
      // Toast + sheet stay open on failure.
    }
  };

  const isDirty = useMemo(
    () => name.trim() !== environment.name.trim(),
    [environment.name, name],
  );

  const revertFields = () => {
    setName(environment.name);
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      revertFields();
    }
    setOpen(newOpen);
  };

  return (
    <>
      {!hideTrigger ? (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
                aria-label={`Edit ${environment.name} environment`}
                onClick={(e) => {
                  e.stopPropagation();
                  setName(environment.name);
                  setError(null);
                  setOpen(true);
                }}
              />
            }
          >
            <AppIcon name="edit" className="size-3.5 text-foreground" />
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end">
            Edit environment
          </TooltipContent>
        </Tooltip>
      ) : null}
      <GuardedSheet
        open={open}
        onOpenChange={handleOpenChange}
        isDirty={isDirty}
        onDiscard={revertFields}
        closeWithoutPromptRef={closeWithoutPromptRef}
      >
        <FormSheetPopup>
          <FormSheetHeader>
            <SheetTitleWithIcon icon="environment">
              Edit Environment
            </SheetTitleWithIcon>
            <SheetDescription>
              Update the environment name. This will change how it appears in
              the tabs.
            </SheetDescription>
          </FormSheetHeader>
          <FormSheetForm key={environment.id} onSubmit={handleSubmit}>
            <FormSheetBody>
              <FormField
                id={`env-name-${environment.id}`}
                label="Name"
                error={error ?? undefined}
                required
              >
                <Input
                  id={`env-name-${environment.id}`}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="development"
                  aria-invalid={Boolean(error)}
                />
              </FormField>
              {isVariablesV2EnabledOnClient() &&
              environment.createdAt &&
              environment.updatedAt ? (
                <ProvenanceDetail
                  createdBy={environment.createdBy}
                  createdAt={environment.createdAt}
                  updatedBy={environment.updatedBy}
                  updatedAt={environment.updatedAt}
                />
              ) : null}
            </FormSheetBody>
            <FormSheetFooter>
              <SheetClose render={<Button variant="ghost" type="button" />}>
                Cancel
              </SheetClose>
              <SubmitButton isLoading={isPending} loadingLabel="Updating…">
                Update
              </SubmitButton>
            </FormSheetFooter>
          </FormSheetForm>
        </FormSheetPopup>
      </GuardedSheet>
    </>
  );
}
