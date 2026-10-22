"use client";

import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import { DataTableActionsColumnHeader } from "@loftlancer/ui/data-table/data-table-actions-column";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { legacyCreateColumnHelper } from "@tanstack/react-table/legacy";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { variablesTableEmpty } from "@/components/data-table/data-table-empty-presets";
import { DataTableRowActions } from "@/components/data-table/data-table-row-actions";
import { AppIcon } from "@/components/patterns/app-icon";
import { ProvenanceAttribution } from "@/components/patterns/provenance-attribution";
import { SecretValue } from "@/components/patterns/secret-value";
import { TableLeadingCell } from "@/components/patterns/table-leading-cell";
import { looksLikeDotenv } from "@/lib/dotenv";
import { CheckIcon } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { isVariablesV2EnabledOnClient } from "@/lib/variables-v2-enabled";
import { AddVariableSheet } from "./add-variable-sheet";
import { EditVariableSheet } from "./edit-variable-sheet";
import { ImportEnvDialog } from "./import-env-dialog";
import {
  VARIABLES_SEARCH_PLACEHOLDER,
  variableColumnClassNames,
} from "./variables-table-columns";

interface Variable {
  id: string;
  key: string;
  value?: string;
  environmentId: string;
  createdAt: Date;
  updatedAt: Date;
  type?: "secret" | "config";
  note?: string | null;
  createdBy?: { id: string; name: string; image: string | null } | null;
  updatedBy?: { id: string; name: string; image: string | null } | null;
}

interface VariablesTableViewProps {
  variables: Variable[];
  isLoading?: boolean;
  isError?: boolean;
  /** Returns the environment as dotenv text (server export). */
  onCopyEnv: () => Promise<string>;
  onImport: (input: {
    variables: { key: string; value: string }[];
    overwrite: boolean;
  }) => Promise<unknown>;
  isImporting: boolean;
  revealedIds: Set<string>;
  revealingIds?: Set<string>;
  onReveal: (id: string) => void;
  onEdit: (variable: Variable) => void;
  onDelete: (id: string) => void;
  onAddVariablesBatch: (data: {
    environmentIds: string[];
    variables: Array<{
      key: string;
      value: string;
      type: "secret" | "config";
      note?: string;
    }>;
  }) => Promise<void>;
  projectEnvironments?: { id: string; name: string }[];
  activeEnvironmentId: string;
  onFetchValue: (id: string, options?: { force?: boolean }) => Promise<string>;
  isAddingVariable: boolean;
  isUpdating?: boolean;
  openFirstVariableForm?: boolean;
  onFirstVariableFormClose?: () => void;
}

const columnHelper = legacyCreateColumnHelper<Variable>();

export function VariablesTableView({
  variables,
  isLoading = false,
  isError = false,
  onCopyEnv,
  onImport,
  isImporting,
  revealedIds,
  revealingIds,
  onReveal,
  onEdit,
  onDelete,
  onAddVariablesBatch,
  projectEnvironments = [],
  activeEnvironmentId,
  onFetchValue,
  isAddingVariable,
  isUpdating = false,
  openFirstVariableForm = false,
  onFirstVariableFormClose,
}: VariablesTableViewProps) {
  const variablesV2 = isVariablesV2EnabledOnClient();

  const isValueRevealed = useCallback(
    (variable: Variable) =>
      variable.type === "config" || revealedIds.has(variable.id),
    [revealedIds],
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    key: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editVariable, setEditVariable] = useState<Variable | null>(null);
  const [editLoadingValue, setEditLoadingValue] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [copyingEnv, setCopyingEnv] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addVariableOpen, setAddVariableOpen] = useState(false);
  const copiedTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (openFirstVariableForm) setAddVariableOpen(true);
  }, [openFirstVariableForm]);

  const setAddVariableSheetOpen = (open: boolean) => {
    setAddVariableOpen(open);
    if (!open && openFirstVariableForm) onFirstVariableFormClose?.();
  };

  const flashCopied = useCallback((id: string) => {
    setCopiedId(id);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const copyValue = useCallback(
    async (variable: Variable) => {
      try {
        const value =
          variable.value !== undefined && isValueRevealed(variable)
            ? variable.value
            : await onFetchValue(variable.id);
        await navigator.clipboard.writeText(value);
        flashCopied(variable.id);
        toast.success(`Copied ${variable.key}`);
      } catch {
        toast.error("Could not copy value");
      }
    },
    [onFetchValue, flashCopied, isValueRevealed],
  );

  const copyAsEnv = async () => {
    setCopyingEnv(true);
    try {
      const text = await onCopyEnv();
      await navigator.clipboard.writeText(text ? `${text}\n` : "");
      toast.success("Copied environment as .env");
    } catch {
      toast.error("Could not copy .env");
    } finally {
      setCopyingEnv(false);
    }
  };

  // Paste a .env block anywhere on the page (outside inputs) to import it.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest?.(
          "input, textarea, [contenteditable=true], [role=dialog]",
        )
      )
        return;
      const text = event.clipboardData?.getData("text/plain") ?? "";
      if (!looksLikeDotenv(text)) return;
      event.preventDefault();
      setImportText(text);
      setImportOpen(true);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  const existingKeys = useMemo(
    () => new Set(variables.map((v) => v.key)),
    [variables],
  );

  const [expandedValueIds, setExpandedValueIds] = useState<Set<string>>(
    () => new Set(),
  );

  const releaseOverlayPointerLock = () => {
    document.body.style.pointerEvents = "";
    document.documentElement.style.pointerEvents = "";
  };

  const handleDelete = useCallback((variable: Variable) => {
    setDeleteTarget({ id: variable.id, key: variable.key });
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (deleteTarget) {
      await onDelete(deleteTarget.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = useCallback(
    (variable: Variable) => {
      window.setTimeout(() => {
        void (async () => {
          setEditVariable(variable);
          setEditDialogOpen(true);
          setEditLoadingValue(true);
          try {
            const value = await onFetchValue(variable.id, { force: true });
            setEditVariable((current) =>
              current?.id === variable.id ? { ...current, value } : current,
            );
          } finally {
            setEditLoadingValue(false);
          }
        })();
      }, 0);
    },
    [onFetchValue],
  );

  const toggleValueExpanded = useCallback((id: string) => {
    setExpandedValueIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("key", {
        enableSorting: false,
        meta: {
          className: variableColumnClassNames.key,
        },
        header: () => (
          <span className="font-medium text-muted-foreground text-xs">Key</span>
        ),
        cell: ({ row }) => {
          const variable = row.original;
          const isRevealed = isValueRevealed(variable);
          return (
            <div className="min-w-0">
              <div className="hidden min-w-0 sm:block">
                <TableLeadingCell leading={<AppIcon name="variable" />}>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="block truncate font-medium font-mono text-sm">
                      {variable.key}
                    </span>
                    {variablesV2 && variable.type ? (
                      <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-[10px]"
                      >
                        {variable.type === "config" ? "Config" : "Secret"}
                      </Badge>
                    ) : null}
                  </div>
                </TableLeadingCell>
              </div>
              <div className="min-w-0 sm:hidden">
                <span className="block truncate font-medium font-mono text-xs">
                  {variable.key}
                </span>
                <SecretValue
                  revealed={isRevealed}
                  value={variable.value}
                  className="mt-0.5 text-muted-foreground text-xs"
                />
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "value",
        meta: {
          className: variableColumnClassNames.value,
        },
        header: "Value",
        enableSorting: false,
        cell: ({ row }) => {
          const variable = row.original;
          const isRevealed = isValueRevealed(variable);
          const isValueExpanded = expandedValueIds.has(variable.id);
          const showExpand =
            isRevealed && Boolean(variable.value && variable.value.length > 80);

          const isConfig = variable.type === "config";
          const revealing = revealingIds?.has(variable.id) ?? false;
          return (
            <div>
              <div className="flex min-w-0 items-center gap-1">
                <SecretValue
                  revealed={isRevealed}
                  value={variable.value}
                  expanded={isValueExpanded}
                  className="min-w-0 flex-1"
                />
                {isConfig ? (
                  <span className="size-7 shrink-0" aria-hidden />
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-10 shrink-0 text-muted-foreground sm:size-7"
                    aria-label={
                      isRevealed
                        ? `Hide ${variable.key}`
                        : `Reveal ${variable.key}`
                    }
                    loading={revealing}
                    onClick={() => onReveal(variable.id)}
                    data-testid="variable-reveal"
                  >
                    <AppIcon name={isRevealed ? "hide" : "reveal"} />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-10 shrink-0 text-muted-foreground sm:size-7"
                  aria-label={`Copy ${variable.key}`}
                  onClick={() => void copyValue(variable)}
                  data-testid="variable-copy"
                >
                  {copiedId === variable.id ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <AppIcon name="copy" />
                  )}
                </Button>
              </div>
              {showExpand ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={() => toggleValueExpanded(variable.id)}
                >
                  {isValueExpanded ? "Collapse" : "Expand"}
                </Button>
              ) : null}
            </div>
          );
        },
      }),
      ...(variablesV2
        ? [
            columnHelper.display({
              id: "updatedBy",
              meta: {
                className: variableColumnClassNames.updatedBy,
              },
              header: "Updated",
              enableSorting: false,
              cell: ({ row }) => {
                const variable = row.original;
                return (
                  <ProvenanceAttribution
                    user={variable.updatedBy ?? variable.createdBy}
                    at={variable.updatedAt}
                    compact
                  />
                );
              },
            }),
          ]
        : []),
      columnHelper.display({
        id: "actions",
        meta: {
          className: variableColumnClassNames.actions,
        },
        header: () => <DataTableActionsColumnHeader />,
        enableSorting: false,
        cell: ({ row }) => {
          const variable = row.original;
          const isRevealed = isValueRevealed(variable);
          const isConfig = variable.type === "config";

          return (
            <div className="flex justify-end">
              <DataTableRowActions
                label="Variable actions"
                actions={[
                  {
                    label: isRevealed ? "Hide value" : "Reveal value",
                    icon: (
                      <AppIcon
                        name={isRevealed ? "hide" : "reveal"}
                        className="me-2 text-foreground"
                      />
                    ),
                    disabled: isConfig || revealingIds?.has(variable.id),
                    onSelect: () => onReveal(variable.id),
                  },
                  {
                    label: "Copy value",
                    icon: (
                      <AppIcon name="copy" className="me-2 text-foreground" />
                    ),
                    onSelect: () => void copyValue(variable),
                  },
                  {
                    label: "Edit",
                    icon: (
                      <AppIcon name="edit" className="me-2 text-foreground" />
                    ),
                    onSelect: () => handleEdit(variable),
                  },
                  {
                    label: "Delete",
                    icon: (
                      <AppIcon name="delete" className="me-2 text-foreground" />
                    ),
                    destructive: true,
                    onSelect: () => handleDelete(variable),
                  },
                ]}
              />
            </div>
          );
        },
      }),
    ],
    [
      copiedId,
      copyValue,
      expandedValueIds,
      handleDelete,
      handleEdit,
      onReveal,
      isValueRevealed,
      revealingIds,
      toggleValueExpanded,
      variablesV2,
    ],
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={variables}
        isLoading={isLoading}
        isError={isError}
        errorTitle="Failed to load variables"
        errorDescription="We could not load environment variables."
        toolbarTrailing={
          <>
            <Button
              type="button"
              variant="outline"
              className="h-8"
              loading={copyingEnv}
              disabled={variables.length === 0}
              onClick={() => void copyAsEnv()}
              data-testid="copy-as-env"
            >
              <AppIcon name="copyEnv" />
              Copy as .env
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-8"
              onClick={() => {
                setImportText("");
                setImportOpen(true);
              }}
              data-testid="import-env"
            >
              <AppIcon name="importFile" />
              Import .env
            </Button>
          </>
        }
        searchable
        searchPlaceholder={VARIABLES_SEARCH_PLACEHOLDER}
        enablePagination={variables.length > 15}
        pageSize={15}
        caption="Environment variables"
        captionSrOnly
        framed
        compactLayout
        empty={variablesTableEmpty(
          <AddVariableSheet
            onConfirm={onAddVariablesBatch}
            environments={projectEnvironments}
            defaultEnvironmentId={activeEnvironmentId}
            isPending={isAddingVariable}
            triggerLayout="tableEmpty"
            open={addVariableOpen}
            onOpenChange={setAddVariableSheetOpen}
          />,
        )}
        primaryAction={
          variables.length > 0 ? (
            <AddVariableSheet
              onConfirm={onAddVariablesBatch}
              environments={projectEnvironments}
              defaultEnvironmentId={activeEnvironmentId}
              isPending={isAddingVariable}
              triggerLayout="toolbar"
              open={addVariableOpen}
              onOpenChange={setAddVariableSheetOpen}
            />
          ) : null
        }
      />

      {editVariable && (
        <EditVariableSheet
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setEditVariable(null);
              setEditLoadingValue(false);
              releaseOverlayPointerLock();
            }
          }}
          variable={editVariable}
          isLoadingValue={editLoadingValue}
          onConfirm={async (data) => {
            const updatedVariable: Variable = {
              ...editVariable,
              key: data.key,
              value: data.value,
              type: data.type ?? editVariable.type,
              note: data.note ?? editVariable.note,
            };
            await onEdit(updatedVariable);
          }}
          isPending={isUpdating}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onOpenChangeComplete={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        title="Delete variable"
        description={`Delete "${deleteTarget?.key ?? "this variable"}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={confirmDelete}
      />

      <ImportEnvDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        initialText={importText}
        existingKeys={existingKeys}
        onImport={onImport}
        isPending={isImporting}
      />
    </>
  );
}
