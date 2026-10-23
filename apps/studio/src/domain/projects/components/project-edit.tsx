"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ProjectOutput } from "@loftlancer/api/types";
import { updateProjectInput } from "@loftlancer/api/validation";
import { Button } from "@loftlancer/ui/button";
import { Card, CardPanel } from "@loftlancer/ui/card";
import { Input } from "@loftlancer/ui/input";
import { Label } from "@loftlancer/ui/label";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { UnsavedChangesPageGuard } from "@loftlancer/ui/patterns/unsaved-changes-page-guard";
import { Switch } from "@loftlancer/ui/switch";
import { Textarea } from "@loftlancer/ui/textarea";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod/v3";
import {
  SettingsField,
  SettingsRow,
  settingsControlWidthClass,
} from "@/components/patterns/settings-layout";
import { cn } from "@/lib/utils";
import { useProjects } from "../hooks/use-projects";

interface EditProjectProps {
  project: ProjectOutput;
  onSuccess?: () => void;
  onCancel?: () => void;
  embedded?: boolean;
}

export function EditProject({
  project,
  onSuccess,
  onCancel,
  embedded = false,
}: EditProjectProps) {
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
  const startDate = form.watch("startDate") || "";
  const targetDate = form.watch("targetDate") || "";
  const dateRangeInvalid =
    startDate.length > 0 && targetDate.length > 0 && targetDate < startDate;

  const onSubmit = async (
    data: z.infer<typeof updateProjectInput>,
    allowNextNavigationWithoutPrompt: () => void,
  ) => {
    if (dateRangeInvalid) {
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

      form.reset(data);
      allowNextNavigationWithoutPrompt();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const fieldInputClass = embedded ? settingsControlWidthClass : undefined;

  const formBody = (guardNavigation: (action: () => void) => void) => (
    <>
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) =>
          embedded ? (
            <SettingsField
              label="Project name"
              description="Required. Shown across the organization."
            >
              <div className="space-y-1">
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Enter project name"
                  disabled={isUpdating}
                  aria-invalid={fieldState.invalid}
                  className={fieldInputClass}
                />
                {fieldState.invalid ? (
                  <p className="text-destructive text-xs">
                    {fieldState.error?.message}
                  </p>
                ) : null}
              </div>
            </SettingsField>
          ) : (
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
          )
        }
      />

      <Controller
        name="purpose"
        control={form.control}
        render={({ field, fieldState }) => (
          <SettingsField
            label="Purpose"
            description="What this project is for. Optional."
            controlClassName="w-full max-w-md"
          >
            <div className="space-y-1">
              <Textarea
                {...field}
                value={field.value ?? ""}
                id={field.name}
                placeholder="Describe the project's purpose"
                rows={3}
                maxLength={500}
                disabled={isUpdating}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? (
                <p className="text-destructive text-xs">
                  {fieldState.error?.message}
                </p>
              ) : null}
            </div>
          </SettingsField>
        )}
      />

      <Controller
        name="documentationUrl"
        control={form.control}
        render={({ field, fieldState }) => (
          <SettingsField
            label="Documentation URL"
            description="Link to project documentation. Optional."
          >
            <div className="space-y-1">
              <Input
                {...field}
                value={field.value ?? ""}
                id={field.name}
                type="url"
                placeholder="https://docs.example.com"
                disabled={isUpdating}
                aria-invalid={fieldState.invalid}
                className={fieldInputClass}
              />
              {fieldState.invalid ? (
                <p className="text-destructive text-xs">
                  {fieldState.error?.message}
                </p>
              ) : null}
            </div>
          </SettingsField>
        )}
      />

      <div
        className={
          embedded ? "grid gap-3 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2"
        }
      >
        <Controller
          name="startDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <SettingsField label="Start date" description="Optional.">
              <div className="space-y-1">
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id={field.name}
                  type="date"
                  disabled={isUpdating}
                  aria-invalid={fieldState.invalid}
                  className={fieldInputClass}
                  onChange={(event) => {
                    field.onChange(event);
                    void form.trigger(["startDate", "targetDate"]);
                  }}
                />
                {fieldState.invalid ? (
                  <p className="text-destructive text-xs">
                    {fieldState.error?.message}
                  </p>
                ) : null}
              </div>
            </SettingsField>
          )}
        />
        <Controller
          name="targetDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <SettingsField label="Target date" description="Optional.">
              <div className="space-y-1">
                <Input
                  {...field}
                  value={field.value ?? ""}
                  id={field.name}
                  type="date"
                  disabled={isUpdating}
                  aria-invalid={fieldState.invalid || dateRangeInvalid}
                  className={fieldInputClass}
                  onChange={(event) => {
                    field.onChange(event);
                    void form.trigger(["startDate", "targetDate"]);
                  }}
                />
                {fieldState.invalid || dateRangeInvalid ? (
                  <p className="text-destructive text-xs">
                    {dateRangeInvalid
                      ? "Target date must be on or after the start date."
                      : fieldState.error?.message}
                  </p>
                ) : null}
              </div>
            </SettingsField>
          )}
        />
      </div>

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) =>
          embedded ? (
            <SettingsField
              label="Description"
              description="Optional summary for your team."
              controlClassName="w-full max-w-md"
            >
              <div className="space-y-1">
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
                {fieldState.invalid ? (
                  <p className="text-destructive text-xs">
                    {fieldState.error?.message}
                  </p>
                ) : null}
                <p
                  className={cn(
                    "text-xs",
                    descriptionLength > 500
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  {descriptionLength}/500 characters
                </p>
              </div>
            </SettingsField>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium text-sm">
                Description{" "}
                <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Provide a brief description of your project…"
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
              <p
                className={cn(
                  "text-xs",
                  descriptionLength > 500
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              >
                {descriptionLength}/500 characters
              </p>
            </div>
          )
        }
      />

      <Controller
        name="isPublic"
        control={form.control}
        render={({ field }) =>
          embedded ? (
            <SettingsRow
              label="Public project"
              description="When enabled, project metadata may be visible to others."
            >
              <Switch
                id="edit-project-visibility"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isUpdating}
              />
            </SettingsRow>
          ) : (
            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div className="min-w-0 flex-1 space-y-0.5">
                <Label htmlFor="edit-project-visibility" className="text-sm">
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
          )
        }
      />

      <Controller
        name="repositoryUrl"
        control={form.control}
        render={({ field, fieldState }) =>
          embedded ? (
            <SettingsField label="Repository URL" description="Optional.">
              <div className="space-y-1">
                <Input
                  {...field}
                  id={field.name}
                  type="url"
                  placeholder="https://github.com/org/repo"
                  disabled={isUpdating}
                  aria-invalid={fieldState.invalid}
                  className={fieldInputClass}
                />
                {fieldState.invalid ? (
                  <p className="text-destructive text-xs">
                    {fieldState.error?.message}
                  </p>
                ) : null}
              </div>
            </SettingsField>
          ) : (
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
                disabled={isUpdating}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <p className="text-destructive text-sm">
                  {fieldState.error?.message}
                </p>
              )}
            </div>
          )
        }
      />

      <Controller
        name="websiteUrl"
        control={form.control}
        render={({ field, fieldState }) =>
          embedded ? (
            <SettingsField label="Website URL" description="Optional.">
              <div className="space-y-1">
                <Input
                  {...field}
                  id={field.name}
                  type="url"
                  placeholder="https://your-project.com"
                  disabled={isUpdating}
                  aria-invalid={fieldState.invalid}
                  className={fieldInputClass}
                />
                {fieldState.invalid ? (
                  <p className="text-destructive text-xs">
                    {fieldState.error?.message}
                  </p>
                ) : null}
              </div>
            </SettingsField>
          ) : (
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
                disabled={isUpdating}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && (
                <p className="text-destructive text-sm">
                  {fieldState.error?.message}
                </p>
              )}
            </div>
          )
        }
      />

      {embedded ? (
        <SettingsRow
          label="Save changes"
          description="Required fields marked in form."
        >
          <div className="flex flex-wrap justify-end gap-2">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => guardNavigation(onCancel)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            ) : null}
            <SubmitButton
              size="sm"
              isLoading={isUpdating}
              loadingLabel="Updating…"
              disabled={!form.formState.isValid || dateRangeInvalid}
            >
              Update project
            </SubmitButton>
          </div>
        </SettingsRow>
      ) : (
        <div className="flex items-center justify-between pt-4">
          <div className="text-muted-foreground text-sm">
            <span className="text-destructive">*</span> Required fields
          </div>
          <div className="flex gap-2">
            {onCancel ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => guardNavigation(onCancel)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            ) : null}
            <SubmitButton
              isLoading={isUpdating}
              loadingLabel="Updating…"
              disabled={!form.formState.isValid || dateRangeInvalid}
            >
              Update Project
            </SubmitButton>
          </div>
        </div>
      )}
    </>
  );

  const revertForm = () =>
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

  if (embedded) {
    return (
      <UnsavedChangesPageGuard
        isDirty={form.formState.isDirty}
        onDiscard={revertForm}
      >
        {({ guardNavigation, allowNextNavigationWithoutPrompt }) => (
          <AccordionSection
            title="Project details"
            description="Name, purpose, dates, links, and visibility."
          >
            <form
              onSubmit={form.handleSubmit((data) =>
                onSubmit(data, allowNextNavigationWithoutPrompt),
              )}
            >
              {formBody(guardNavigation)}
            </form>
          </AccordionSection>
        )}
      </UnsavedChangesPageGuard>
    );
  }

  return (
    <UnsavedChangesPageGuard
      isDirty={form.formState.isDirty}
      onDiscard={revertForm}
    >
      {({ guardNavigation, allowNextNavigationWithoutPrompt }) => (
        <Card>
          <CardPanel>
            <form
              onSubmit={form.handleSubmit((data) =>
                onSubmit(data, allowNextNavigationWithoutPrompt),
              )}
              className="space-y-4"
            >
              {formBody(guardNavigation)}
            </form>
          </CardPanel>
        </Card>
      )}
    </UnsavedChangesPageGuard>
  );
}
