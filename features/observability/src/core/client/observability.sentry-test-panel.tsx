"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { useId, useState } from "react";
import type { SentryTestResult } from "../../types/observability.sentry-test.types";

/**
 * Small panel for the Sentry test-error pages (#354). The app passes
 * `onTrigger`, which throws from app code and reports to Sentry. With
 * `requireToken`, the token is only kept in component state, sent once in a
 * header and cleared afterwards. The result line keeps a fixed height.
 */
export function SentryTestPanel({
  app,
  requireToken,
  onTrigger,
}: {
  app: string;
  requireToken: boolean;
  onTrigger: (token: string) => Promise<SentryTestResult>;
}) {
  const inputId = useId();
  const [token, setToken] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<SentryTestResult | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      setResult(await onTrigger(token));
    } catch {
      setResult({ status: "rejected" });
    } finally {
      setToken("");
      setPending(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-card text-card-foreground ring-border flex flex-col gap-3 rounded-xl p-4 text-sm ring-1"
      >
        <div className="space-y-0.5">
          <h1 className="text-sm font-semibold">Sentry test error</h1>
          <p className="text-muted-foreground text-xs">
            Sends one browser test error from {app} to Sentry, tagged{" "}
            <code>test: true</code>.
          </p>
        </div>
        {requireToken ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-xs font-medium">
              Test token
            </label>
            <Input
              id={inputId}
              type="password"
              autoComplete="off"
              className="h-8"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        ) : null}
        <Button
          type="submit"
          size="sm"
          disabled={pending || (requireToken && token.length === 0)}
        >
          Throw browser test error
        </Button>
        <p className="text-muted-foreground min-h-4 text-xs" aria-live="polite">
          {result?.status === "sent"
            ? `Sent${result.eventId ? `, event ${result.eventId}` : ""}.`
            : result?.status === "rejected"
              ? "Not accepted."
              : ""}
        </p>
      </form>
    </main>
  );
}
