"use client";

import { SubmitButton } from "@features/patterns/core/client/patterns.submit-button";
import { isReservedOrgSlugForCreation } from "@loftlancer/t3-env/reserved-slugs";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { SheetClose, SheetDescription } from "@loftlancer/ui/sheet";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
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
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, setPending] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugTouched) setSlug(slugifyOrganizationName(name));
  }, [name, slugTouched]);

  useEffect(() => {
    if (open) return;
    setName("");
    setSlug("");
    setSlugTouched(false);
    setSlugError(null);
  }, [open]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedSlug = slugifyOrganizationName(slug);
    const reserved = isReservedOrgSlugForCreation(normalizedSlug);
    const invalidSlug =
      normalizedSlug.length < 2 ||
      normalizedSlug.length > 200 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug) ||
      reserved;
    if (
      normalizedName.length < 2 ||
      normalizedName.length > 100 ||
      invalidSlug
    ) {
      setSlugError(
        invalidSlug
          ? reserved
            ? "That slug is reserved. Choose a different slug."
            : "Enter a valid organization slug."
          : null,
      );
      return;
    }

    setPending(true);
    try {
      const result = await toast.promise(
        authClient.organization.create({
          name: normalizedName,
          slug: normalizedSlug,
        }),
        {
          loading: "Creating organization…",
          success: "Organization created",
          error: "Could not create organization",
        },
      );
      const organizationId = result.data?.id;
      if (!organizationId) return;
      captureEvent(STUDIO_EVENTS.organizationCreated, { source: "sheet" });
      await afterOrganizationCreated(organizationId);
      const createdSlug = result.data?.slug ?? normalizedSlug;
      closeWithoutPromptRef.current?.();
      onOpenChange(false);
      router.push(routes.org(createdSlug));
    } catch {
      // toast handles errors
    } finally {
      setPending(false);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      isDirty={Boolean(name || slug)}
      onDiscard={() => {
        setName("");
        setSlug("");
        setSlugTouched(false);
        setSlugError(null);
      }}
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
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="organization"
                required
                minLength={2}
                maxLength={100}
              />
            </FormField>
            <FormField
              id="org-create-slug"
              label="Slug"
              required
              hint="Lowercase letters, numbers, and hyphens."
              error={slugError ?? undefined}
            >
              <OrgSlugInput
                id="org-create-slug"
                value={slug}
                onChange={(value) => {
                  setSlugTouched(true);
                  setSlug(value);
                  setSlugError(null);
                }}
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
              disabled={
                pending ||
                name.trim().length < 2 ||
                name.trim().length > 100 ||
                slugifyOrganizationName(slug).length < 2
              }
            >
              Create organization
            </SubmitButton>
          </FormSheetFooter>
        </FormSheetForm>
      </FormSheetPopup>
    </FormSheet>
  );
}
