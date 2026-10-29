import { Skeleton } from "@loftlancer/ui/skeleton";
import { AccountSettingsSkeleton } from "@/module/settings/settings.skeleton";

export default function SettingsLoading() {
  return (
    <section className="min-w-0 space-y-4">
      <div aria-hidden="true">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-1 h-5 w-64 max-w-full" />
      </div>
      <AccountSettingsSkeleton />
    </section>
  );
}
