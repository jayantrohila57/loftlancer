"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ProjectOutput } from "@loftlancer/api/types";
import { updateProjectInput } from "@loftlancer/api/validation";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { Label } from "@loftlancer/ui/label";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { SheetClose, SheetDescription } from "@loftlancer/ui/sheet";
import { Switch } from "@loftlancer/ui/switch";
import { Textarea } from "@loftlancer/ui/textarea";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v3";
import {
  FormSheet,
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { RequiredFieldsHint } from "@/components/patterns/required-fields-hint";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { useProjects } from "../hooks/use-projects";

interface EditProjectSheetProps {
  project: ProjectOutput;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProjectSheet({
  project,
  open,
  onOpenChange,
  onSuccess,
}: EditProjectSheetProps) {
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const { updateProject, isUpdating } = useProjects();

  const form = useForm({
    resolver: zodResolver(updateProjectInput),
    defaultValues: {
      id: project.id,
      name: project.name,
      description: project.description || "",
      purpose: project.purpose || "",
      documentationUrl: project.documentationUrl || "",
      startDate: project.startDate || "",
      targetDate: project.targetDate || "",
      repositoryUrl: project.repositoryUrl || "",
      websiteUrl: project.websiteUrl || "",
      isPublic: project.isPublic,
    },
    mode: "onChange",
  });

  const descriptionLength = form.watch("description")?.length ?? 0;

  useEffect(() => {
    if (open) {
      form.reset({
        id: project.id,
        name: project.name,
        description: project.description || "",
        purpose: project.purpose || "",
        documentationUrl: project.documentationUrl || "",
        startDate: project.startDate || "",
        targetDate: project.targetDate || "",
        repositoryUrl: project.repositoryUrl || "",
        websiteUrl: project.websiteUrl || "",
        isPublic: project.isPublic,
      });
    }
  }, [open, project, form]);

  const onSubmit = async (data: z.infer<typeof updateProjectInput>) => {
    if (data.startDate && data.targetDate && data.targetDate < data.startDate) {
      form.setError("targetDate", {
        type: "validate",
        message: "Target date must be on or after the start date.",
      });
      return;
    }
    try {
      await updateProject({
        id: data.id,
        name: data.name?.trim(),
        description: data.description?.trim() || undefined,
        purpose: data.purpose?.trim() || null,
        documentationUrl: data.documentationUrl?.trim() || null,
        startDate: data.startDate || null,
        targetDate: data.targetDate || null,
        repositoryUrl: data.repositoryUrl?.trim() || undefined,
        websiteUrl: data.websiteUrl?.trim() || undefined,
        isPublic: data.isPublic,
      });
      closeWithoutPromptRef.current?.();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      isDirty={form.formState.isDirty}
      onDiscard={() =>
        form.reset({
          id: project.id,
          name: project.name,
          description: project.description || "",
          purpose: project.purpose || "",
          documentationUrl: project.documentationUrl || "",
          startDate: project.startDate || "",
          targetDate: project.targetDate || "",
          repositoryUrl: project.repositoryUrl || "",
          websiteUrl: project.websiteUrl || "",
          isPublic: project.isPublic,
        })
      }
      closeWithoutPromptRef={closeWithoutPromptRef}
    >
      <FormSheetPopup>
        <FormSheetHeader>
          <SheetTitleWithIcon icon="edit">Edit Project</SheetTitleWithIcon>
          <SheetDescription>
            Update details for &quot;{project.name}&quot;. Changes are saved
            when you submit.
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={form.handleSubmit(onSubmit)}>
          <FormSheetBody>
            <RequiredFieldsHint />
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
                    disabled={isUpdating}
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
                  <div className="flex items-baseline justify-between gap-2">
                    <Label htmlFor={field.name} className="font-medium text-sm">
                      Description
                    </Label>
                    <span
                      className={`shrink-0 text-xs tabular-nums ${
                        descriptionLength > 500
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {descriptionLength}/500
                    </span>
                  </div>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder="Brief description…"
                    rows={4}
                    maxLength={500}
                    className="wrap-anywhere resize-none"
                    disabled={isUpdating}
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
            <div className="space-y-2">
              <Label htmlFor="edit-project-purpose">Purpose</Label>
              <Textarea
                id="edit-project-purpose"
                maxLength={500}
                rows={3}
                placeholder="What is this project for?"
                disabled={isUpdating}
                {...form.register("purpose")}
              />
              {form.formState.errors.purpose ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.purpose.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-documentation-url">
                Documentation URL
              </Label>
              <Input
                id="edit-project-documentation-url"
                type="url"
                placeholder="https://docs.example.com"
                disabled={isUpdating}
                aria-invalid={Boolean(form.formState.errors.documentationUrl)}
                {...form.register("documentationUrl")}
              />
              {form.formState.errors.documentationUrl ? (
                <p className="text-destructive text-sm">
                  {form.formState.errors.documentationUrl.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-project-start-date">Start date</Label>
                <Input
                  id="edit-project-start-date"
                  type="date"
                  disabled={isUpdating}
                  {...form.register("startDate")}
                />
                {form.formState.errors.startDate ? (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.startDate.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-project-target-date">Target date</Label>
                <Input
                  id="edit-project-target-date"
                  type="date"
                  disabled={isUpdating}
                  {...form.register("targetDate")}
                />
                {form.formState.errors.targetDate ? (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.targetDate.message}
                  </p>
                ) : null}
              </div>
            </div>
            <Controller
              name="isPublic"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-2 rounded-lg border p-2">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <Label
                      htmlFor="edit-project-visibility"
                      className="text-sm"
                    >
                      Public project
                    </Label>
                    <p className="wrap-anywhere text-muted-foreground text-xs">
                      When enabled, project metadata may be visible to others.
                    </p>
                  </div>
                  <Switch
                    id="edit-project-visibility"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isUpdating}
                    className="shrink-0"
                  />
                </div>
              )}
            />
            <Controller
              name="repositoryUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="font-medium text-sm">
                    Repository URL
                  </Label>
                  <Input
                    {...field}
                    id={field.name}
                    type="url"
                    placeholder="https://github.com/org/repo"
                    disabled={isUpdating}
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
                    Website URL
                  </Label>
                  <Input
                    {...field}
                    id={field.name}
                    type="url"
                    placeholder="https://your-project.com"
                    disabled={isUpdating}
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
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose
              render={
                <Button variant="ghost" type="button" disabled={isUpdating} />
              }
            >
              Cancel
            </SheetClose>
            <SubmitButton
              isLoading={isUpdating}
              loadingLabel="Updating…"
              disabled={!form.formState.isValid}
            >
              Update Project
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </FormSheet>
  );
}
