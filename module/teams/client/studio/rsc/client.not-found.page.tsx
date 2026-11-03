import { PageStatusNotFound } from "@loftlancer/ui/patterns/page-state";
export function TeamsNotFound() {
  return (
    <PageStatusNotFound
      title="Team not found"
      description="This team does not exist or is no longer available."
    />
  );
}
