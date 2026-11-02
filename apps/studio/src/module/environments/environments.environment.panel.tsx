"use client";

import { useEffect, useState } from "react";
import { useVariables } from "@/module/environments/environments.use.variables";
import { VariablesTableView } from "@/module/environments/environments.variables.table.view";

interface Variable {
  id: string;
  key: string;
  environmentId: string;
  createdAt: Date;
  updatedAt: Date;
  value?: string;
  type?: "secret" | "config";
  note?: string | null;
  createdBy?: { id: string; name: string; image: string | null } | null;
  updatedBy?: { id: string; name: string; image: string | null } | null;
}

interface EnvironmentPanelProps {
  environmentId: string;
  projectEnvironments?: { id: string; name: string }[];
}

export function EnvironmentPanel({
  environmentId,
  projectEnvironments = [],
}: EnvironmentPanelProps) {
  const [openFirstVariableForm, setOpenFirstVariableForm] = useState(false);
  useEffect(() => {
    if (
      window.sessionStorage.getItem("loftlancer:first-run-add-variable") === "1"
    ) {
      window.sessionStorage.removeItem("loftlancer:first-run-add-variable");
      setOpenFirstVariableForm(true);
    }
  }, []);
  const {
    variables,
    status,
    revealedIds,
    revealingIds,
    toggleReveal,
    createVariablesBatch,
    isCreating,
    updateVariable,
    isUpdating,
    deleteVariable,
    getRevealedValue,
    fetchVariableValue,
    bulkImport,
    isImporting,
    exportDotenv,
  } = useVariables(environmentId);

  const variablesWithValues = variables.map((variable) => ({
    ...variable,
    value:
      variable.type === "config" && variable.value !== undefined
        ? variable.value
        : getRevealedValue(variable.id),
  }));

  const handleCreateBatch = async (data: {
    environmentIds: string[];
    variables: Array<{
      key: string;
      value: string;
      type: "secret" | "config";
      note?: string;
    }>;
  }) => {
    await createVariablesBatch(data);
  };

  const handleEdit = async (variable: Variable) => {
    await updateVariable({
      id: variable.id,
      key: variable.key,
      value: variable.value ?? "",
      type: variable.type,
      note: variable.note ?? null,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteVariable({ id });
  };

  const isLoading = status === "loading" && variables.length === 0;

  return (
    <VariablesTableView
      variables={variablesWithValues}
      isLoading={isLoading}
      isError={status === "error"}
      onCopyEnv={exportDotenv}
      onImport={(input) => bulkImport({ environmentId, ...input })}
      isImporting={isImporting}
      revealedIds={revealedIds}
      revealingIds={revealingIds}
      onReveal={toggleReveal}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAddVariablesBatch={handleCreateBatch}
      projectEnvironments={projectEnvironments}
      activeEnvironmentId={environmentId}
      onFetchValue={fetchVariableValue}
      isAddingVariable={isCreating}
      isUpdating={isUpdating}
      openFirstVariableForm={openFirstVariableForm}
      onFirstVariableFormClose={() => setOpenFirstVariableForm(false)}
    />
  );
}
