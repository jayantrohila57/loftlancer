"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { FormField } from "@/components/patterns/form-field";
import { initialsFromLabel } from "@/lib/initials";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

export function OrganizationBrandingEditor() {
  const queryClient = useQueryClient();
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
          hint="Use a public HTTPS image URL. Image uploads are not configured yet."
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
            {initialsFromLabel(query.data?.name ?? "", "OR")}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          disabled={!canEdit || !value || mutation.isPending}
          onClick={() => setDraft("")}
        >
          Remove logo
        </Button>
        <Button
          disabled={!canEdit || value === current || mutation.isPending}
          onClick={() => mutation.mutate({ logo: value.trim() || null })}
        >
          {mutation.isPending ? "Saving…" : "Save logo"}
        </Button>
      </div>
    </AccordionSection>
  );
}
