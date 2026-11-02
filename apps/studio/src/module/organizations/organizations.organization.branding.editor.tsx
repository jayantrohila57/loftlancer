"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { AppIcon } from "@/components/patterns/app-icon";
import { FormField } from "@/components/patterns/form-field";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

export function OrganizationBrandingEditor() {
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const { refreshOrganizations } = useActiveOrganization();
  const query = useQuery(trpc.organizations.getProfile.queryOptions());
  const canEdit = query.data?.canManageBranding === true;
  const [draft, setDraft] = useState<string | null>(null);
  const current = query.data?.logo ?? "";
  const value = draft ?? current;
  const mutation = useMutation(
    trpc.organizations.updateBrandingLogo.mutationOptions({
      onSuccess: async () => {
        setDraft(null);
        await queryClient.invalidateQueries({
          queryKey: trpc.organizations.getProfile.queryKey(),
        });
        await refreshOrganizations();
        toast.success("Organization logo saved.");
      },
      onError: () => toast.error("Could not save organization logo."),
    }),
  );

  return (
    <AccordionSection
      title="Branding"
      description="Set the logo used to identify this organization."
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <FormField
          id="organization-logo-url"
          label="Logo image URL"
          hint="Use a public HTTPS image URL."
        >
          <Input
            id="organization-logo-url"
            type="url"
            placeholder="https://example.com/logo.png"
            value={value}
            disabled={!canEdit || query.isPending}
            onChange={(event) => setDraft(event.target.value)}
          />
        </FormField>
        <Avatar className="size-12">
          <AvatarImage
            src={value || undefined}
            alt="Organization logo preview"
          />
          <AvatarFallback>
            <AppIcon name="organization" className="size-5" />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          disabled={!canEdit || !value || mutation.isPending}
          onClick={() =>
            confirm({
              title: "Remove organization logo?",
              description:
                "This clears the logo URL from the form. Save changes to apply the removal.",
              confirmLabel: "Remove logo",
              variant: "destructive",
              onConfirm: () => setDraft(""),
            })
          }
        >
          Remove logo
        </Button>
        <Button
          disabled={!canEdit || value === current || mutation.isPending}
          onClick={() => mutation.mutate({ logo: value.trim() || null })}
        >
          {mutation.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
      {ConfirmDialog}
    </AccordionSection>
  );
}
