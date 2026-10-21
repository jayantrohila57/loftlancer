"use client";

import { Button } from "@loftlancer/ui/button";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FormField } from "@/components/patterns/form-field";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

type SettingsDraft = {
  timeZone: string;
  locale: string;
  dateFormat: "short" | "medium" | "long";
  timeFormat: "12h" | "24h";
  weekStart: number;
  displayCurrency: string;
  defaultProjectVisibility: "private" | "public";
  notificationDefaults: { email: boolean; inApp: boolean; version: 1 };
};

export function OrganizationPreferencesEditor() {
  const client = useQueryClient();
  const query = useQuery(trpc.organizations.getSettings.queryOptions());
  const [draft, setDraft] = useState<SettingsDraft | null>(null);
  const mutation = useMutation(
    trpc.organizations.updateSettings.mutationOptions({
      onSuccess: async () => {
        await client.invalidateQueries({
          queryKey: trpc.organizations.getSettings.queryKey(),
        });
        setDraft(null);
        toast.success("Workspace defaults saved.");
      },
      onError: () => toast.error("Could not save workspace defaults."),
    }),
  );
  const saved = query.data;
  useEffect(() => {
    if (saved && !draft) {
      setDraft({
        timeZone: saved.timeZone,
        locale: saved.locale,
        dateFormat: saved.dateFormat as SettingsDraft["dateFormat"],
        timeFormat: saved.timeFormat as SettingsDraft["timeFormat"],
        weekStart: saved.weekStart,
        displayCurrency: saved.displayCurrency,
        defaultProjectVisibility:
          saved.defaultProjectVisibility as SettingsDraft["defaultProjectVisibility"],
        notificationDefaults: saved.notificationDefaults,
      });
    }
  }, [draft, saved]);

  if (!saved || !draft) {
    return (
      <AccordionSection
        title="Workspace defaults"
        description="Loading organization preferences…"
      >
        <p className="text-muted-foreground text-sm">
          Please wait while organization preferences load.
        </p>
      </AccordionSection>
    );
  }
  const update = <K extends keyof SettingsDraft>(
    key: K,
    value: SettingsDraft[K],
  ) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  const savedDraft: SettingsDraft = {
    timeZone: saved.timeZone,
    locale: saved.locale,
    dateFormat: saved.dateFormat as SettingsDraft["dateFormat"],
    timeFormat: saved.timeFormat as SettingsDraft["timeFormat"],
    weekStart: saved.weekStart,
    displayCurrency: saved.displayCurrency,
    defaultProjectVisibility:
      saved.defaultProjectVisibility as SettingsDraft["defaultProjectVisibility"],
    notificationDefaults: saved.notificationDefaults,
  };
  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);
  const select = <K extends keyof SettingsDraft>(
    key: K,
    options: readonly { value: string; label: string }[],
  ) => (
    <select
      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
      value={String(draft[key])}
      disabled={!saved.canEdit || mutation.isPending}
      onChange={(event) =>
        update(
          key,
          (key === "weekStart"
            ? Number(event.target.value)
            : event.target.value) as SettingsDraft[K],
        )
      }
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
  return (
    <AccordionSection
      title="Workspace defaults"
      description="Set presentation defaults for this organization. Personal choices and existing project settings remain unchanged."
      actions={
        saved.canEdit ? (
          <Button
            disabled={mutation.isPending || !isDirty}
            onClick={() => mutation.mutate(draft)}
          >
            {mutation.isPending ? "Saving…" : "Save defaults"}
          </Button>
        ) : null
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="org-time-zone" label="Time zone">
          <input
            id="org-time-zone"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={draft.timeZone}
            disabled={!saved.canEdit}
            onChange={(event) => update("timeZone", event.target.value)}
            placeholder="America/New_York"
          />
        </FormField>
        <FormField id="org-locale" label="Locale">
          <input
            id="org-locale"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={draft.locale}
            disabled={!saved.canEdit}
            onChange={(event) => update("locale", event.target.value)}
            placeholder="en-US"
          />
        </FormField>
        <FormField id="org-date-format" label="Date format">
          {select("dateFormat", [
            { value: "short", label: "Short" },
            { value: "medium", label: "Medium" },
            { value: "long", label: "Long" },
          ])}
        </FormField>
        <FormField id="org-time-format" label="Time format">
          {select("timeFormat", [
            { value: "12h", label: "12-hour" },
            { value: "24h", label: "24-hour" },
          ])}
        </FormField>
        <FormField id="org-week-start" label="Week starts on">
          {select("weekStart", [
            { value: "0", label: "Sunday" },
            { value: "1", label: "Monday" },
            { value: "6", label: "Saturday" },
          ])}
        </FormField>
        <FormField id="org-currency" label="Display currency">
          <input
            id="org-currency"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm uppercase"
            value={draft.displayCurrency}
            maxLength={3}
            disabled={!saved.canEdit}
            onChange={(event) =>
              update("displayCurrency", event.target.value.toUpperCase())
            }
          />
        </FormField>
        <FormField id="org-project-default" label="New project visibility">
          {select("defaultProjectVisibility", [
            { value: "private", label: "Private" },
            { value: "public", label: "Public" },
          ])}
        </FormField>
        <div className="flex flex-col gap-3 rounded-md border p-3">
          <p className="font-medium text-sm">
            Notification defaults for new members
          </p>
          {(["email", "inApp"] as const).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.notificationDefaults[key]}
                disabled={!saved.canEdit}
                onChange={(event) =>
                  update("notificationDefaults", {
                    ...draft.notificationDefaults,
                    [key]: event.target.checked,
                  })
                }
              />
              {key === "email" ? "Email notifications" : "In-app notifications"}
            </label>
          ))}
          <p className="text-muted-foreground text-xs">
            Only applies where a new member has not chosen a preference.
          </p>
        </div>
      </div>
    </AccordionSection>
  );
}
