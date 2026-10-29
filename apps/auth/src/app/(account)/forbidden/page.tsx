import { Button } from "@loftlancer/ui/button";
import { PageStatusForbidden } from "@loftlancer/ui/patterns/page-state";
import { ShieldX } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Access denied" };

export default async function ForbiddenPage() {
  return (
    <PageStatusForbidden
      icon={ShieldX}
      description="You do not have permission to view this page."
      action={
        <Button size="sm" render={<Link href={"/settings/profile" as Route} />}>
          Account settings
        </Button>
      }
    />
  );
}
