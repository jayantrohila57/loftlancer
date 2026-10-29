"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { Input } from "@loftlancer/ui/input";
import { SubmitButton } from "@loftlancer/ui/patterns/submit-button";
import { UnsavedChangesPageGuard } from "@loftlancer/ui/patterns/unsaved-changes-page-guard";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useSession } from "@/domain/auth/lib/auth-actions";
import { initialsFromLabel } from "@/lib/initials";
import { toast } from "@/lib/toast";
import {
  SettingsField,
  SettingsPanel,
  SettingsRow,
  settingsControlWidthClass,
} from "@/module/settings/settings.layout";
import { updateProfile } from "./settings.profile.api";

export function ProfileSettingsForm({
  initialUser,
}: {
  initialUser: { name: string; email: string; image: string | null };
}) {
  const [name, setName] = useState(initialUser.name);
  const [avatarUrl, setAvatarUrl] = useState(initialUser.image ?? "");
  const [saved, setSaved] = useState({
    name: initialUser.name,
    image: initialUser.image ?? "",
  });
  const dirty = name !== saved.name || avatarUrl !== saved.image;
  const { refetch } = useSession();
  const save = useMutation({
    mutationFn: async () =>
      updateProfile({
        name: name.trim(),
        image: avatarUrl.trim() || undefined,
      }),
    onSuccess: async () => {
      setSaved({ name, image: avatarUrl });
      toast.success("Profile updated");
      await refetch();
    },
    onError: (error: Error) =>
      toast.error(error.message ?? "Could not update profile"),
  });

  return (
    <UnsavedChangesPageGuard
      isDirty={dirty}
      onDiscard={() => {
        setName(saved.name);
        setAvatarUrl(saved.image);
      }}
    >
      {() => (
        <>
          <SettingsPanel>
            <SettingsField label="Avatar" description="Image URL (HTTPS).">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Avatar className="size-12 shrink-0">
                  <AvatarImage src={avatarUrl || undefined} alt="" />
                  <AvatarFallback>
                    {initialsFromLabel(name || initialUser.email, "US")}
                  </AvatarFallback>
                </Avatar>
                <Input
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://…"
                  aria-label="Avatar image URL"
                  className={settingsControlWidthClass}
                />
              </div>
            </SettingsField>
            <SettingsField label="Display name" description="Shown in the UI.">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-label="Display name"
                className={settingsControlWidthClass}
              />
            </SettingsField>
            <SettingsRow label="Email" description="Sign-in email (read-only).">
              <span className="text-sm">{initialUser.email}</span>
            </SettingsRow>
            <SettingsRow label="Save" description="Apply profile changes.">
              <SubmitButton
                type="button"
                size="sm"
                className="w-fit"
                isLoading={save.isPending}
                loadingLabel="Saving…"
                disabled={!dirty || !name.trim()}
                onClick={() => save.mutate()}
              >
                Save changes
              </SubmitButton>
            </SettingsRow>
          </SettingsPanel>
        </>
      )}
    </UnsavedChangesPageGuard>
  );
}
