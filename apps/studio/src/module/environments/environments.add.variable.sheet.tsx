"use client";

import { variableKeySchema } from "@loftlancer/api/validation";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { Separator } from "@loftlancer/ui/separator";
import {
  SheetClose,
  SheetDescription,
  SheetTrigger,
} from "@loftlancer/ui/sheet";
import { Textarea } from "@loftlancer/ui/textarea";
import { useMemo, useRef, useState } from "react";
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
import { EnvironmentMultiSelect } from "@/module/environments/environments.environment.multi.select";
import {
  type VariableType,
  VariableTypeSegmented,
} from "@/module/environments/environments.variable.type.segmented";

export type VariableDraftRow = {
  id: string;
  type: VariableType;
  key: string;
  value: string;
  note: string;
};

function emptyRow(): VariableDraftRow {
  return {
    id: crypto.randomUUID(),
    type: "secret",
    key: "",
    value: "",
    note: "",
  };
}

interface AddVariableSheetProps {
  environments: { id: string; name: string }[];
  defaultEnvironmentId: string;
  onConfirm: (data: {
    environmentIds: string[];
    variables: Array<{
      key: string;
      value: string;
      type: VariableType;
      note?: string;
    }>;
  }) => Promise<void>;
  isPending: boolean;
  triggerLayout?: "toolbar" | "tableEmpty";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddVariableSheet({
  environments,
  defaultEnvironmentId,
  onConfirm,
  isPending,
  triggerLayout = "toolbar",
  open: openProp,
  onOpenChange,
}: AddVariableSheetProps) {
  const isToolbar = triggerLayout === "toolbar";
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [environmentIds, setEnvironmentIds] = useState<string[]>([
    defaultEnvironmentId,
  ]);
  const [rows, setRows] = useState<VariableDraftRow[]>([emptyRow()]);
  const [envError, setEnvError] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setEnvironmentIds([defaultEnvironmentId]);
    setRows([emptyRow()]);
    setEnvError(null);
    setRowErrors({});
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
    if (environmentIds.length === 0) {
      setEnvError("Select at least one environment");
      return;
    }
    setEnvError(null);

    const errors: Record<string, string> = {};
    const payload: Array<{
      key: string;
      value: string;
      type: VariableType;
      note?: string;
    }> = [];

    for (const row of rows) {
      const keyError = validateKey(row.key);
      if (keyError) {
        errors[row.id] = keyError;
        continue;
      }
      if (!row.value.trim()) {
        errors[row.id] = "Value is required";
        continue;
      }
      payload.push({
        key: row.key.trim().toUpperCase(),
        value: row.value,
        type: row.type,
        note: row.note.trim() || undefined,
      });
    }

    if (Object.keys(errors).length > 0) {
      setRowErrors(errors);
      return;
    }
    setRowErrors({});

    try {
      await onConfirm({ environmentIds, variables: payload });
      closeWithoutPromptRef.current?.();
      setOpen(false);
      reset();
    } catch {
      // Toast + sheet stay open on failure.
    }
  };

  const updateRow = (id: string, patch: Partial<VariableDraftRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
    if (patch.key !== undefined) {
      const keyError = validateKey(patch.key);
      setRowErrors((prev) => {
        const next = { ...prev };
        if (keyError) next[id] = keyError;
        else delete next[id];
        return next;
      });
    }
  };

  const isDirty = useMemo(() => {
    const envChanged =
      environmentIds.length !== 1 || environmentIds[0] !== defaultEnvironmentId;
    const rowsDirty = rows.some(
      (row) => row.key.trim() || row.value.trim() || row.note.trim(),
    );
    return envChanged || rowsDirty || rows.length > 1;
  }, [defaultEnvironmentId, environmentIds, rows]);

  return (
    <GuardedSheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
        else
          setEnvironmentIds((ids) =>
            ids.length > 0 ? ids : [defaultEnvironmentId],
          );
      }}
      isDirty={isDirty}
      onDiscard={reset}
      onClosed={reset}
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
      <SheetTrigger
        render={
          <Button
            size="sm"
            className={
              isToolbar
                ? "max-sm:size-8 max-sm:gap-0 max-sm:px-0 sm:gap-1.5"
                : "gap-1.5"
            }
            aria-label={isToolbar ? "Add variable" : undefined}
          />
        }
      >
        <AppIcon name="plus" className="text-current" />
        {isToolbar ? (
          <span className="sr-only sm:not-sr-only">Add variable</span>
        ) : (
          "Add variable"
        )}
      </SheetTrigger>
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="variable">Add variables</SheetTitleWithIcon>
          <SheetDescription>
            Add one or more variables to the selected environments.
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={handleSubmit}>
          <FormSheetBody>
            <EnvironmentMultiSelect
              environments={environments}
              value={environmentIds}
              onChange={setEnvironmentIds}
              error={envError ?? undefined}
            />
            <div className="flex flex-col gap-4">
              {rows.map((row, index) => (
                <div key={row.id} className="flex flex-col gap-3">
                  {index > 0 ? <Separator /> : null}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-muted-foreground text-xs">
                      Variable {index + 1}
                    </span>
                    {rows.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-muted-foreground"
                        onClick={() =>
                          setRows((prev) =>
                            prev.filter((item) => item.id !== row.id),
                          )
                        }
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <FormField id={`${row.id}-type`} label="Type">
                    <VariableTypeSegmented
                      value={row.type}
                      onChange={(type) => updateRow(row.id, { type })}
                    />
                  </FormField>
                  <FormField
                    id={`${row.id}-key`}
                    label="Key"
                    error={rowErrors[row.id]}
                    required
                  >
                    <Input
                      id={`${row.id}-key`}
                      value={row.key}
                      onChange={(e) =>
                        updateRow(row.id, { key: e.target.value })
                      }
                      placeholder="DATABASE_URL"
                      className="font-mono"
                      aria-invalid={Boolean(rowErrors[row.id])}
                    />
                  </FormField>
                  <FormField id={`${row.id}-value`} label="Value" required>
                    <Textarea
                      id={`${row.id}-value`}
                      value={row.value}
                      onChange={(e) =>
                        updateRow(row.id, { value: e.target.value })
                      }
                      placeholder="your-value-here"
                      rows={row.type === "secret" ? 3 : 4}
                      className="wrap-anywhere max-h-72 min-h-20 overflow-y-auto font-mono"
                      autoComplete="off"
                      spellCheck={row.type === "config"}
                      data-1p-ignore
                      style={
                        row.type === "secret"
                          ? ({
                              WebkitTextSecurity: "disc",
                            } as React.CSSProperties)
                          : undefined
                      }
                    />
                  </FormField>
                  <FormField id={`${row.id}-note`} label="Note">
                    <Textarea
                      id={`${row.id}-note`}
                      value={row.note}
                      onChange={(e) =>
                        updateRow(row.id, { note: e.target.value })
                      }
                      placeholder="Optional description for your team"
                      rows={2}
                      className="min-h-16 resize-y"
                    />
                  </FormField>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit gap-1.5"
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
            >
              <AppIcon name="plus" className="size-3.5" />
              Add another
            </Button>
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose render={<Button variant="ghost" type="button" />}>
              Cancel
            </SheetClose>
            <SubmitButton isLoading={isPending} loadingLabel="Saving…">
              Save
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </GuardedSheet>
  );
}
