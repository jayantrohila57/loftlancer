"use client";

import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import { Auth5Panel } from "@loftlancer/ui/patterns/auth-5";
import { SignInOptions } from "@loftlancer/ui/patterns/sign-in-options";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  OAuthDecisionButtons,
  OAuthScopeCard,
} from "@/components/oauth-scope-card";
import { authClient } from "@/lib/auth-client";

type ConsentScreenProps = {
  clientId: string;
  scope: string | null;
  claimsJson: string | null;
  consentReturnTo: string;
};

export function ConsentScreen({
  clientId,
  scope,
  claimsJson,
  consentReturnTo,
}: ConsentScreenProps) {
  const { data: session, isPending } = authClient.useSession();
  const [clientName, setClientName] = useState<string | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [submitting, setSubmitting] = useState<"approve" | "deny" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      setLoadingClient(false);
      return;
    }
    let cancelled = false;
    void authClient.oauth2
      .publicClient({
        query: { client_id: clientId },
      })
      .then(({ data, error: clientError }) => {
        if (cancelled) return;
        if (clientError || !data) {
          setError("Could not load application details.");
          return;
        }
        setClientName(data.client_name ?? data.client_id ?? clientId);
      })
      .finally(() => {
        if (!cancelled) setLoadingClient(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId, session?.user]);

  const handleConsent = async (accept: boolean) => {
    setSubmitting(accept ? "approve" : "deny");
    setError(null);
    try {
      const requestedClaims = claimsJson ? JSON.parse(claimsJson) : undefined;
      const { data, error: consentError } = await authClient.oauth2.consent({
        accept,
        ...(scope ? { scope } : {}),
        ...(requestedClaims !== undefined ? { claims: requestedClaims } : {}),
      });
      const redirectTarget =
        data && "redirect_uri" in data && typeof data.redirect_uri === "string"
          ? data.redirect_uri
          : data && "url" in data && typeof data.url === "string"
            ? data.url
            : null;
      if (consentError || !redirectTarget) {
        setError("Authorization could not be completed. Try again.");
        return;
      }
      window.location.assign(redirectTarget);
    } catch {
      setError("Authorization could not be completed. Try again.");
    } finally {
      setSubmitting(null);
    }
  };

  const displayName = clientName ?? clientId;

  return (
    <Auth5Panel layout="centered" showTerms={false}>
      <Card className="w-full border-0 bg-transparent shadow-none before:hidden">
        <CardHeader>
          <CardTitle>Authorize application</CardTitle>
          <CardDescription>
            Review what this application is requesting before you continue.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-3">
          {!isPending && !session?.user ? (
            <div className="flex flex-col gap-3 rounded-xl p-4 ring-1 ring-border/60">
              <p className="text-muted-foreground text-sm">
                Sign in to approve access for this application.
              </p>
              <SignInOptions returnTo={consentReturnTo} />
            </div>
          ) : (
            <>
              <OAuthScopeCard
                appName={isPending || loadingClient ? null : displayName}
                appMeta={
                  clientName && clientName !== clientId
                    ? `Client ID ${clientId}`
                    : null
                }
                scope={scope}
              />
              <OAuthDecisionButtons
                submitting={submitting}
                disabled={isPending || loadingClient || !session?.user}
                onApprove={() => void handleConsent(true)}
                onDeny={() => void handleConsent(false)}
              />
            </>
          )}
          <p
            role="alert"
            className="min-h-4 text-destructive text-xs leading-4"
          >
            {error ?? ""}
          </p>
          <Button variant="ghost" size="sm" render={<Link href="/settings" />}>
            Back to account
          </Button>
        </CardPanel>
      </Card>
    </Auth5Panel>
  );
}
