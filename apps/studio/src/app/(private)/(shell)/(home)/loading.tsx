import { Spinner } from "@loftlancer/ui/spinner";

export default function OrganizationsLoading() {
  return (
    <div
      className="flex min-h-48 flex-1 items-center justify-center py-12"
      aria-busy="true"
    >
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
