"use client";

import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useCan } from "@/domain/permissions/hooks/use-permissions";
import { routes } from "@/utils/navigation";

export function SupportFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const canListTickets = useCan("support.ticket.list");
  const ticketsHref = routes.supportTickets();
  const helpHref = routes.supportHelp();
  const isTicketDetail =
    pathname.startsWith(`${ticketsHref}/`) && pathname !== ticketsHref;
  const isHelpArticle = pathname.startsWith(`${helpHref}/`);
  const back = isTicketDetail
    ? { href: ticketsHref, label: "Tickets" }
    : isHelpArticle
      ? { href: helpHref, label: "Help center" }
      : { href: routes.home(), label: "Studio" };

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={back}
      title="Support"
      description="Get help with Loftlancer and track support requests."
      tabs={[
        ...(canListTickets.allowed || canListTickets.isLoading
          ? [
              {
                href: ticketsHref,
                label: "Tickets",
                active: pathname.startsWith(ticketsHref),
              },
            ]
          : []),
        {
          href: helpHref,
          label: "Help",
          active: pathname.startsWith(helpHref),
        },
      ]}
    >
      {children}
    </SettingsFrame>
  );
}
