"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { isReservedOrgSlugForCreation } from "@loftlancer/env/reserved-slugs";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { SheetClose, SheetDescription } from "@loftlancer/ui/sheet";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod/v3";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { OrgSlugInput } from "@/components/org/org-slug-input";
import { FormField } from "@/components/patterns/form-field";
import {
  FormSheet,
  FormSheetBody,
  FormSheetFooter,
  FormSheetForm,
  FormSheetHeader,
  FormSheetPopup,
} from "@/components/patterns/form-sheet";
import { SheetTitleWithIcon } from "@/components/patterns/sheet-title-with-icon";
import { authClient } from "@/lib/auth-client";
import { slugifyOrganizationName } from "@/lib/org-slug";
import { captureEvent, STUDIO_EVENTS } from "@/lib/posthog";
import { toast } from "@/lib/toast";
import { routes } from "@/utils/navigation";

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  slug: z
    .string()
    .trim()
    .transform((value) => slugifyOrganizationName(value))
    .pipe(
      z
        .string()
        .min(2, "Slug is required")
        .max(200)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .refine((slug) => !isReservedOrgSlugForCreation(slug), {
          message: "That slug is reserved. Choose a different slug.",
        }),
    ),
});

type CreateOrganizationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateOrganizationSheet({
  open,
  onOpenChange,
}: CreateOrganizationSheetProps) {
  const router = useRouter();
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const { afterOrganizationCreated } = useActiveOrganization();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "" },
    mode: "onChange",
  });

  const nameValue = useWatch({ control: form.control, name: "name" });
  const slugTouched = form.formState.touchedFields.slug;

  useEffect(() => {
    if (slugTouched) return;
    const next = slugifyOrganizationName(nameValue);
    if (next) form.setValue("slug", next, { shouldValidate: true });
  }, [nameValue, slugTouched, form]);

  useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await toast.promise(
        authClient.organization.create({
          name: values.name,
          slug: values.slug,
        }),
        {
          loading: "Creating organization…",
          success: "Organization created",
          error: "Could not create organization",
        },
      );
      const orgId = result.data?.id;
      if (orgId) {
        captureEvent(STUDIO_EVENTS.organizationCreated, { source: "sheet" });
        await afterOrganizationCreated(orgId);
        const slug = result.data?.slug ?? values.slug;
        closeWithoutPromptRef.current?.();
        onOpenChange(false);
        router.push(routes.org(slug));
      }
    } catch {
      // toast handles errors
    }
  });

  const pending = form.formState.isSubmitting;

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
          <SheetTitleWithIcon icon="organization">
            New organization
          </SheetTitleWithIcon>
          <SheetDescription>
            Create an organization, then invite people from its Members page.
          </SheetDescription>
        </FormSheetHeader>
        <FormSheetForm onSubmit={onSubmit}>
          <FormSheetBody>
            <FormField id="org-create-name" label="Name" required>
              <Input
                id="org-create-name"
                {...form.register("name")}
                autoComplete="organization"
              />
            </FormField>
            <FormField
              id="org-create-slug"
              label="Slug"
              required
              hint="Lowercase letters, numbers, and hyphens."
              error={form.formState.errors.slug?.message}
            >
              <Controller
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <OrgSlugInput
                    id="org-create-slug"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          </FormSheetBody>
          <FormSheetFooter>
            <SheetClose
              render={
                <Button variant="ghost" type="button" disabled={pending} />
              }
            >
              Cancel
            </SheetClose>
            <SubmitButton
              isLoading={pending}
              loadingLabel="Creating…"
              disabled={!form.formState.isValid}
            >
              Create organization
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </FormSheet>
  );
}
