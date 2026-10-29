"use client";

import { Button } from "@loftlancer/ui/button";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { routes } from "@loftlancer/ui/studio-routes";
import { Switch } from "@loftlancer/ui/switch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studioDashboardPath } from "@/lib/studio-url";
import { toast } from "@/lib/toast";
import { ErrorState } from "@/shared/components/shared.error-state";
import { trpc } from "@/utils/trpc";
import { NotificationPreferencesSkeleton } from "./settings.notifications.skeleton";
import type { SettingsNotificationPreferences } from "./settings.types";

const EVENT_GROUPS = [
  { key: "invitations", label: "Invitations" },
  { key: "membership", label: "Membership changes" },
  { key: "projectActivity", label: "Project updates" },
  { key: "support", label: "Support replies" },
] as const;

export function NotificationPreferencesPanel({
  initialPreferences,
}: {
  initialPreferences: SettingsNotificationPreferences;
}) {
  const queryClient = useQueryClient();
  const preferencesQuery = useQuery({
    ...trpc.notifications.preferences.queryOptions(),
    initialData: initialPreferences,
    staleTime: 30_000,
  });
  const preferences = preferencesQuery.data?.data.preferences;
  const emailVerified = preferencesQuery.data?.data.emailVerified ?? false;
  const studioNotifications = studioDashboardPath(routes.notifications());
  const updatePreferences = useMutation(
    trpc.notifications.updatePreferences.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.notifications.preferences.queryKey(),
        });
        toast.success("Notification preferences saved");
      },
      onError: () => toast.error("Could not save notification preferences"),
    }),
  );

  if (preferencesQuery.isPending) {
    return <NotificationPreferencesSkeleton />;
  }

  const updateChannel = (
    group: (typeof EVENT_GROUPS)[number]["key"],
    channel: "inApp" | "email",
    checked: boolean,
  ) => {
    if (!preferences) return;
    updatePreferences.mutate({
      ...preferences,
      [group]: { ...preferences[group], [channel]: checked },
    });
  };

  return (
    <AccordionSection title="Notification preferences">
      {preferencesQuery.isError ? (
        <ErrorState
          title="Could not load notification preferences"
          description="Try loading your notification settings again."
          onRetry={() => void preferencesQuery.refetch()}
        />
      ) : preferences ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Choose where to receive each type of update. Email alerts require a
            verified email address.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th scope="col" className="pb-2 text-left font-medium">
                    Update
                  </th>
                  <th scope="col" className="pb-2 text-center font-medium">
                    In-app
                  </th>
                  <th scope="col" className="pb-2 text-center font-medium">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {EVENT_GROUPS.map(({ key, label }) => (
                  <tr key={key} className="border-t">
                    <th
                      scope="row"
                      className="border-t py-3 text-left font-medium"
                    >
                      {label}
                    </th>
                    <td className="border-t py-3 text-center">
                      <Switch
                        aria-label={`${label} in-app notifications`}
                        checked={preferences[key].inApp}
                        disabled={updatePreferences.isPending}
                        onCheckedChange={(checked) =>
                          updateChannel(key, "inApp", checked)
                        }
                      />
                    </td>
                    <td className="border-t py-3 text-center">
                      <Switch
                        aria-label={`${label} email notifications`}
                        checked={preferences[key].email}
                        disabled={updatePreferences.isPending || !emailVerified}
                        onCheckedChange={(checked) =>
                          updateChannel(key, "email", checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!emailVerified ? (
            <p className="text-muted-foreground text-xs">
              Verify your account email to turn on email alerts.
            </p>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            render={<a href={studioNotifications} rel="noopener noreferrer" />}
          >
            View notifications
          </Button>
        </div>
      ) : (
        <ErrorState
          title="Notification preferences are unavailable"
          description="Try loading your notification settings again."
          onRetry={() => void preferencesQuery.refetch()}
        />
      )}
    </AccordionSection>
  );
}
