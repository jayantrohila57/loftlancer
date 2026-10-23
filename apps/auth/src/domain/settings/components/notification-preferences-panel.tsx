"use client";

import { Button } from "@loftlancer/ui/button";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { routes } from "@loftlancer/ui/studio-routes";
import { studioDashboardPath } from "@/lib/studio-url";

export function NotificationPreferencesPanel() {
  const studioNotifications = studioDashboardPath(routes.notifications());

  return (
    <AccordionSection title="Notification preferences">
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">
          In-app notifications are managed in your dashboard. Open your inbox to
          mark items as read or review recent activity.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          render={
            <a href={studioNotifications} rel="noopener noreferrer">
              Open notifications
            </a>
          }
        >
          Open notifications
        </Button>
      </div>
    </AccordionSection>
  );
}
