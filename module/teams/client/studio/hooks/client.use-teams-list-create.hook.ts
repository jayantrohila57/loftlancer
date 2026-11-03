"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { teamCreateInputSchema } from "../../../utils/validation/utils.create-team.validation";
import { routes } from "../config/client.routes";
import { useTeamCreate } from "./client.use-teams-create.hook";
import { useCan } from "./client.use-teams-permission.hook";

export function useTeamsListCreate(_orgId: string, slug: string) {
  const create = useTeamCreate();
  const canCreate = useCan("team.create");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    name: "",
    purpose: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const summaryRef = useRef<HTMLDivElement>(null);
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const reset = () => {
    setValues({ name: "", purpose: "", description: "" });
    setErrors({});
    create.reset();
  };
  const validate = () => {
    const parsed = teamCreateInputSchema.safeParse(values);
    setErrors(parsed.success ? {} : parsed.error.flatten().fieldErrors);
    return parsed;
  };
  const submit = async () => {
    if (create.isPending || !canCreate.allowed) return;
    const parsed = validate();
    if (!parsed.success) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    const result = await create.mutateAsync(parsed.data).catch(() => null);
    if (
      result?.status === "success" &&
      result.data &&
      !Array.isArray(result.data)
    ) {
      closeWithoutPromptRef.current?.();
      setOpen(false);
      reset();
      router.push(routes.team(slug, result.data.id) as never);
    } else if (result?.status === "failed" && result.error) {
      const fields: Record<string, string[]> = {};
      for (const key of ["name", "purpose", "description"]) {
        const value = (result.error as Record<string, unknown>)[key];
        if (typeof value === "string") fields[key] = [value];
        else if (Array.isArray(value))
          fields[key] = value.filter(
            (item): item is string => typeof item === "string",
          );
      }
      setErrors(fields);
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  };
  return {
    create,
    canCreate,
    open,
    setOpen,
    values,
    setValues,
    errors,
    validate,
    submit,
    reset,
    summaryRef,
    closeWithoutPromptRef,
  };
}
