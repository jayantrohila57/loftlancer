"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { FormField } from "@/components/patterns/form-field";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

type Field = readonly [
  string,
  string,
  string,
  "text" | "url" | "email" | "tel" | "number" | "textarea" | "select",
];
const groups: readonly {
  title: string;
  description: string;
  fields: readonly Field[];
}[] = [
  {
    title: "Profile",
    description: "A short introduction and public organization details.",
    fields: [
      ["description", "Description", "A short introduction", "textarea"],
      ["websiteUrl", "Website", "https://example.com", "url"],
      ["industry", "Industry", "Industry", "text"],
    ],
  },
  {
    title: "Company details",
    description: "Organization size and legal details.",
    fields: [
      ["legalName", "Legal name", "Registered company name", "text"],
      ["sizeBand", "Organization size", "Choose a size", "select"],
      ["foundedYear", "Founded year", "2020", "number"],
    ],
  },
  {
    title: "Contact",
    description: "Private organization contact and address details.",
    fields: [
      ["contactEmail", "Contact email", "team@example.com", "email"],
      ["contactPhone", "Contact phone", "+1 555 0100", "tel"],
      ["supportUrl", "Support website", "https://example.com/support", "url"],
      ["countryCode", "Country code", "US", "text"],
      ["region", "State or region", "Region", "text"],
      ["city", "City", "City", "text"],
      ["postalCode", "Postal code", "Postal code", "text"],
      ["addressLine1", "Address", "Address line 1", "text"],
      ["addressLine2", "Address line 2", "Address line 2", "text"],
    ],
  },
];

type Profile = Record<string, string | number | Date | boolean | null>;

export function OrganizationProfileEditor() {
  const canEdit = useCan("organization.settings.update").allowed;
  const query = useQuery(trpc.organizations.getProfile.queryOptions());

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-4">
        {groups.map((group) => (
          <AccordionSectionSkeleton key={group.title} rows={2} />
        ))}
      </div>
    );
  }
  if (query.isError) {
    return (
      <ErrorState
        title="Profile unavailable"
        description="Could not load organization details."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const profile = query.data as Profile;
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <OrganizationProfileSection
          key={group.title}
          group={group}
          profile={profile}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}

function OrganizationProfileSection({
  group,
  profile,
  canEdit,
}: {
  group: (typeof groups)[number];
  profile: Profile;
  canEdit: boolean;
}) {
  const queryClient = useQueryClient();
  const initialDraft = Object.fromEntries(
    group.fields.map(([key]) => [key, String(profile[key] ?? "")]),
  );
  const [draft, setDraft] = useState(initialDraft);
  const mutation = useMutation(
    trpc.organizations.updateProfile.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.organizations.getProfile.queryKey(),
        });
        toast.success(`${group.title} saved.`);
      },
      onError: () =>
        toast.error(`Could not save ${group.title.toLowerCase()}.`),
    }),
  );
  const isDirty = group.fields.some(
    ([key]) => draft[key] !== initialDraft[key],
  );
  const set = (key: string, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  return (
    <AccordionSection
      title={group.title}
      description={group.description}
      actions={
        canEdit ? (
          <Button
            disabled={mutation.isPending || !isDirty}
            onClick={() =>
              mutation.mutate(
                Object.fromEntries(
                  Object.entries(draft).map(([key, value]) => [
                    key,
                    key === "foundedYear"
                      ? value.trim()
                        ? Number(value)
                        : null
                      : value.trim() || null,
                  ]),
                ) as never,
              )
            }
          >
            {mutation.isPending
              ? "Saving…"
              : `Save ${group.title.toLowerCase()}`}
          </Button>
        ) : null
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {group.fields.map(([key, label, placeholder, type]) => (
          <FormField key={key} id={`organization-profile-${key}`} label={label}>
            {type === "textarea" ? (
              <textarea
                id={`organization-profile-${key}`}
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                disabled={!canEdit}
                value={draft[key]}
                placeholder={placeholder}
                onChange={(event) => set(key, event.target.value)}
              />
            ) : type === "select" ? (
              <select
                id={`organization-profile-${key}`}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                disabled={!canEdit}
                value={draft[key]}
                onChange={(event) => set(key, event.target.value)}
              >
                <option value="">Choose a size</option>
                {["1-10", "11-50", "51-200", "201-1000", "1001+"].map(
                  (size) => (
                    <option key={size} value={size}>
                      {size} people
                    </option>
                  ),
                )}
              </select>
            ) : (
              <Input
                id={`organization-profile-${key}`}
                type={type}
                min={type === "number" ? 1000 : undefined}
                max={type === "number" ? new Date().getFullYear() : undefined}
                disabled={!canEdit}
                value={draft[key]}
                placeholder={placeholder}
                onChange={(event) => set(key, event.target.value)}
              />
            )}
          </FormField>
        ))}
      </div>
    </AccordionSection>
  );
}
