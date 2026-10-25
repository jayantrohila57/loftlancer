"use client";

import { describeMcpOAuthScopes } from "@loftlancer/actions";
import { Button } from "@loftlancer/ui/button";
import { Spinner } from "@loftlancer/ui/spinner";
import { ArrowLeftRightIcon, CheckIcon, KeyRoundIcon } from "lucide-react";
import type { ReactNode } from "react";

type OAuthScopeCardProps = {
  /** Client display name (or id when no name is registered). */
  appName: string | null;
  /** Secondary identity line, e.g. client id or resource. */
  appMeta?: string | null;
  scope: string | null | undefined;
  /** Optional extra rows rendered under the scope list. */
  children?: ReactNode;
};

/**
 * Consent / device approval card (reui dialog-14 inspired): app ↔ Loftlancer
 * identity row, enumerated real scopes. Fixed skeleton height while loading
 * so the layout never shifts once client details arrive.
 */
export function OAuthScopeCard({
  appName,
  appMeta,
  scope,
  children,
}: OAuthScopeCardProps) {
  const scopeItems = describeMcpOAuthScopes(scope);
  const initial = appName?.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex flex-col gap-3 rounded-md p-4 ring-1 ring-border/60">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-lg bg-muted font-semibold text-sm"
          >
            {initial}
          </span>
          <ArrowLeftRightIcon
            aria-hidden
            className="size-3.5 text-muted-foreground"
          />
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              viewBox="0 0 24 24"
              aria-label="Loftlancer"
              className="size-4 fill-current"
            >
              <path d="M3 21V9l9-6 9 6v12h-6v-7H9v7H3z" />
            </svg>
          </span>
        </div>
        <div className="flex min-w-0 flex-col">
          {appName ? (
            <span className="truncate font-medium text-sm">{appName}</span>
          ) : (
            <span className="h-5 w-32 animate-pulse rounded bg-muted" />
          )}
          <span className="truncate text-muted-foreground text-xs">
            {appMeta ?? "wants access to your Loftlancer account"}
          </span>
        </div>
      </div>

      <div className="border-border/60 border-t" />

      <div className="flex flex-col gap-1.5">
        <p className="font-medium text-muted-foreground text-xs">
          This will allow it to
        </p>
        {scopeItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Sign you in. No additional access was requested.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {scopeItems.map((item) => (
              <li key={item.scope} className="flex items-start gap-2 text-sm">
                <CheckIcon
                  aria-hidden
                  className="mt-0.5 size-3.5 shrink-0 text-primary"
                />
                <span className="flex min-w-0 flex-col">
                  <span>{item.description}</span>
                  <code className="font-mono text-muted-foreground text-xs">
                    {item.scope}
                  </code>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {children}
    </div>
  );
}

type DecisionButtonsProps = {
  submitting: "approve" | "deny" | null;
  disabled?: boolean;
  onApprove: () => void;
  onDeny: () => void;
  approveLabel?: string;
};

/** Allow / Cancel pair; labels stay fixed and a spinner overlays to avoid shift. */
export function OAuthDecisionButtons({
  submitting,
  disabled,
  onApprove,
  onDeny,
  approveLabel = "Allow",
}: DecisionButtonsProps) {
  const busy = submitting !== null || disabled;
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="relative"
        disabled={busy}
        onClick={onDeny}
      >
        <span className={submitting === "deny" ? "invisible" : undefined}>
          Cancel
        </span>
        {submitting === "deny" ? <Spinner className="absolute size-4" /> : null}
      </Button>
      <Button
        type="button"
        size="sm"
        className="relative"
        disabled={busy}
        onClick={onApprove}
      >
        <span
          className={
            submitting === "approve"
              ? "invisible inline-flex items-center gap-1.5"
              : "inline-flex items-center gap-1.5"
          }
        >
          <KeyRoundIcon aria-hidden className="size-3.5" />
          {approveLabel}
        </span>
        {submitting === "approve" ? (
          <Spinner className="absolute size-4" />
        ) : null}
      </Button>
    </div>
  );
}
