"use client";

import { Button } from "@loftlancer/ui/button";
import { useRouter } from "next/navigation";
import { routes } from "@/utils/navigation";

/** Shared entry point for creating a ticket from any Support page. */
export function SupportTicketCreateAction({ children }: { children: string }) {
  const router = useRouter();

  return (
    <Button onClick={() => router.push(routes.supportNewTicket())}>
      {children}
    </Button>
  );
}
