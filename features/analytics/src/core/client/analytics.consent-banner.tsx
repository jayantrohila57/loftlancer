"use client";

import { Button } from "@loftlancer/ui/button";
import { analyticsConsentConfig } from "../../config/analytics.consent.config";
import { useAnalyticsConsent } from "./analytics.consent.hook";

/**
 * Small fixed banner asking once for optional analytics. Fixed positioning
 * means it never shifts layout; it renders nothing until the browser has
 * read the stored choice, and nothing at all once a choice exists.
 */
export function AnalyticsConsentBanner({
  policyHref = analyticsConsentConfig.defaultPolicyHref,
}: {
  policyHref?: string;
}) {
  const [consent, setConsent] = useAnalyticsConsent();
  if (consent !== "unset") return null;

  return (
    <section
      aria-label="Analytics consent"
      className="bg-popover text-popover-foreground fixed inset-x-3 bottom-3 z-50 flex flex-col gap-2 rounded-lg border p-3 text-sm shadow-lg sm:right-auto sm:max-w-sm"
    >
      <p className="text-muted-foreground">
        We use optional analytics to understand how Loftlancer is used. Nothing
        loads unless you accept.{" "}
        <a href={policyHref} className="underline underline-offset-2">
          Cookie policy
        </a>
      </p>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setConsent("denied")}>
          Decline
        </Button>
        <Button size="sm" onClick={() => setConsent("granted")}>
          Accept
        </Button>
      </div>
    </section>
  );
}
