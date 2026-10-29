"use client";

import { variableKeySchema } from "@loftlancer/api/validation";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { SheetClose, SheetDescription } from "@loftlancer/ui/sheet";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { Textarea } from "@loftlancer/ui/textarea";
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  type VariableType,
  VariableTypeSegmented,
} from "@/module/environments/environments.variable.type.segmented";

interface EditVariableSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variable: {
    id: string;
    key: string;
    value?: string;
    type?: VariableType;
    note?: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: ProvenanceUser | null;
    updatedBy?: ProvenanceUser | null;
  };
  isLoadingValue?: boolean;
  onConfirm: (data: {
    id: string;
    key: string;
    value: string;
    type: VariableType;
    note: string | null;
  }) => Promise<void>;
  isPending: boolean;
}

export function EditVariableSheet({
  open,
  onOpenChange,
  variable,
  isLoadingValue = false,
  onConfirm,
  isPending,
}: EditVariableSheetProps) {
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [key, setKey] = useState(variable.key);
  const [value, setValue] = useState(variable.value || "");
  const [type, setType] = useState<VariableType>(variable.type ?? "secret");
  const [note, setNote] = useState(variable.note ?? "");
  const [error, setError] = useState<string | null>(null);

  const baselineKey = variable.key;
  const baselineValue = variable.value ?? "";
  const baselineType = variable.type ?? "secret";
  const baselineNote = variable.note ?? "";

  useEffect(() => {
    if (open) {
      setKey(baselineKey);
      setValue(baselineValue);
      setType(baselineType);
      setNote(baselineNote);
      setError(null);
    }
  }, [open, baselineKey, baselineValue, baselineType, baselineNote]);

  const isDirty = useMemo(
    () =>
      key.trim().toUpperCase() !== baselineKey.trim().toUpperCase() ||
      value !== baselineValue ||
      type !== baselineType ||
      note !== baselineNote,
    [
      baselineKey,
      baselineNote,
      baselineType,
      baselineValue,
      key,
      note,
      type,
      value,
    ],
  );

  const revertFields = () => {
    setKey(baselineKey);
    setValue(baselineValue);
    setType(baselineType);
    setNote(baselineNote);
    setError(null);
  };

  const validateKey = (rawKey: string) => {
    const result = variableKeySchema.safeParse(rawKey);
    if (!result.success) {
      return result.error.issues[0]?.message ?? "Invalid key";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keyError = validateKey(key);
    if (keyError) {
      setError(keyError);
      return;
    }
    setError(null);
    try {
      await onConfirm({
        id: variable.id,
        key: key.trim().toUpperCase(),
        value,
        type,
        note: note.trim() || null,
      });
      closeWithoutPromptRef.current?.();
      onOpenChange(false);
    } catch {
      // Toast + sheet stay open on failure.
    }
  };

  return (
    <GuardedSheet
      open={open}
      onOpenChange={onOpenChange}
      isDirty={isDirty}
      onDiscard={revertFields}
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="variable">Edit variable</SheetTitleWithIcon>
          <SheetDescription>
            Update type, key, value, and note for this environment.
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={handleSubmit}>
          <FormSheetBody>
            <FormField id="edit-type" label="Type">
              <VariableTypeSegmented
                value={type}
                onChange={setType}
                disabled={isLoadingValue}
              />
            </FormField>
            <FormField
              id="edit-key"
              label="Key"
              error={error ?? undefined}
              required
            >
              <Input
                id="edit-key"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  if (error) setError(validateKey(e.target.value));
                }}
                placeholder="DATABASE_URL"
                className="font-mono"
                aria-invalid={Boolean(error)}
                disabled={isLoadingValue}
              />
            </FormField>
            <FormField id="edit-value" label="Value" required>
              <div className="relative min-h-24">
                {isLoadingValue ? (
                  <>
                    <Skeleton
                      className="absolute inset-0 min-h-24 w-full rounded-md"
                      aria-hidden
                    />
                    <span className="sr-only">Loading current value</span>
                  </>
                ) : null}
                <Textarea
                  id="edit-value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="your-value-here"
                  rows={3}
                  disabled={isLoadingValue}
                  className="wrap-anywhere max-h-72 min-h-24 overflow-y-auto font-mono"
                  autoComplete="off"
                  style={
                    type === "secret"
                      ? ({ WebkitTextSecurity: "disc" } as React.CSSProperties)
                      : undefined
                  }
                />
              </div>
            </FormField>
            <FormField id="edit-note" label="Note">
              <Textarea
                id="edit-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional description"
                rows={2}
                disabled={isLoadingValue}
                className="min-h-16 resize-y"
              />
            </FormField>
            <ProvenanceDetail
              createdBy={variable.createdBy}
              createdAt={variable.createdAt}
              updatedBy={variable.updatedBy}
              updatedAt={variable.updatedAt}
            />
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose render={<Button variant="ghost" type="button" />}>
              Cancel
            </SheetClose>
            <SubmitButton
              isLoading={isPending}
              loadingLabel="Updating…"
              disabled={isLoadingValue}
            >
              Update
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </GuardedSheet>
  );
}
