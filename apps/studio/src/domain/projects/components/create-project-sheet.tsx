"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectInput } from "@loftlancer/api/validation";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { Label } from "@loftlancer/ui/label";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { SheetClose, SheetDescription } from "@loftlancer/ui/sheet";
import { Switch } from "@loftlancer/ui/switch";
import { Textarea } from "@loftlancer/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v3";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import {
  FormSheet,
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";

import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useProjects } from "../hooks/use-projects";

interface CreateProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectSheet({
  open,
  onOpenChange,
}: CreateProjectSheetProps) {
  const router = useRouter();
  const org = useCurrentOrgSlug() ?? "";
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const { createProject, isCreating } = useProjects();
  const orgSettings = useQuery(trpc.organizations.getSettings.queryOptions());

  const form = useForm({
    resolver: zodResolver(createProjectInput),
    defaultValues: {
      name: "",
      description: "",
      repositoryUrl: "",
      websiteUrl: "",
      isPublic: false,
    },
    mode: "onChange",
  });

  const descriptionLength = form.watch("description")?.length ?? 0;

  useEffect(() => {
    if (open && !form.formState.isDirty && orgSettings.data) {
      form.setValue(
        "isPublic",
        orgSettings.data.defaultProjectVisibility === "public",
        { shouldDirty: false },
      );
    }
  }, [form, form.formState.isDirty, open, orgSettings.data]);

  const onSubmit = async (data: z.infer<typeof createProjectInput>) => {
    try {
      const result = await createProject({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        repositoryUrl: data.repositoryUrl?.trim() || undefined,
        websiteUrl: data.websiteUrl?.trim() || undefined,
        isPublic: data.isPublic,
      });

      form.reset();
      closeWithoutPromptRef.current?.();
      onOpenChange(false);
      const slug = result?.data?.slug;
      if (slug) {
        router.push(routes.project(org, slug));
      } else {
        router.push(routes.projects(org));
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      isDirty={form.formState.isDirty}
      onDiscard={() => form.reset()}
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="project">
            Create New Project
          </SheetTitleWithIcon>
          <SheetDescription>
            Add a new project to organize your environment variables.
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={form.handleSubmit(onSubmit)}>
          <FormSheetBody>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-medium text-sm">
                    Project Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Enter project name"
                    disabled={isCreating}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <p className="text-destructive text-sm">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-medium text-sm">
                    Description{" "}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Brief description of your project…"
                    rows={4}
                    maxLength={500}
                    className="wrap-anywhere resize-none"
                    disabled={isCreating}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <p className="text-destructive text-sm">
                      {fieldState.error?.message}
                    </p>
                  )}
                  <p
                    className={`text-xs ${
                      descriptionLength > 500
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {descriptionLength}/500 characters
                  </p>
                </div>
              )}
            />
            <Controller
              name="repositoryUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-medium text-sm">
                    Repository URL{" "}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    {...field}
                    id={field.name}
                    type="url"
                    placeholder="https://github.com/org/repo"
                    disabled={isCreating}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <p className="text-destructive text-sm">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="websiteUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-medium text-sm">
                    Website URL{" "}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    {...field}
                    id={field.name}
                    type="url"
                    placeholder="https://your-project.com"
                    disabled={isCreating}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <p className="text-destructive text-sm">
                      {fieldState.error?.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="isPublic"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-2 rounded-lg border p-2">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <Label htmlFor="project-visibility" className="text-sm">
                      Public project
                    </Label>
                    <p className="wrap-anywhere text-muted-foreground text-xs">
                      Private by default. Public projects may expose metadata to
                      others.
                    </p>
                  </div>
                  <Switch
                    id="project-visibility"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isCreating}
                    className="shrink-0"
                  />
                </div>
              )}
            />
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose
              render={
                <Button variant="ghost" type="button" disabled={isCreating} />
              }
            >
              Cancel
            </SheetClose>
            <SubmitButton
              isLoading={isCreating}
              loadingLabel="Creating…"
              disabled={!form.formState.isValid}
            >
              Create Project
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </FormSheet>
  );
}
