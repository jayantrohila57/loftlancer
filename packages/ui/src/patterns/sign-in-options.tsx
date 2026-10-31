"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Button, buttonVariants } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";
import {
  isGoogleSignInEnabled,
  resolveAuthAppOrigin,
  type SignInProvider,
  studioHomeUrl,
} from "../lib/auth-links";
import { cn } from "../lib/utils";
import { AuthDivider, GithubMark, GoogleMark } from "./auth-5";

/**
 * The only way into Loftlancer (#373): GitHub, Google (#359, when
 * configured) and an email magic link. No passwords anywhere.
 *
 * Zero layout shift: buttons keep their width while loading (label swaps
 * inside a full-width button), and the status line under the email field
 * always reserves one line for the hint, "sent" and error messages.
 */

type MagicLinkState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

const ERROR_MESSAGES: Record<string, string> = {
  magic_link: "That sign-in link is invalid or expired. Request a new one.",
  oauth: "Sign-in didn't finish. Try again.",
};

export type SignInOptionsProps = {
  /** Auth app origin incl. basePath; defaults to NEXT_PUBLIC_AUTH_URL. */
  authOrigin?: string;
  /** Where to land after sign-in (validated by the auth app). Default: /studio. */
  returnTo?: string;
  /** Where sign-in errors should return. Defaults to the current site root. */
  errorPath?: string;
  /** Override the build-time Google flag (tests, previews). */
  googleEnabled?: boolean;
  onProviderClick?: (provider: SignInProvider) => void;
  onMagicLinkSubmit?: () => void;
  className?: string;
};

export function SignInOptions({
  authOrigin,
  returnTo,
  errorPath = "/",
  googleEnabled = isGoogleSignInEnabled(),
  onProviderClick,
  onMagicLinkSubmit,
  className,
}: SignInOptionsProps) {
  const auth = (authOrigin ?? resolveAuthAppOrigin()).replace(/\/$/, "");
  const [redirecting, setRedirecting] = useState<SignInProvider | null>(null);
  const [email, setEmail] = useState("");
  const [magic, setMagic] = useState<MagicLinkState>({ status: "idle" });

  // Errors come back from the auth app as ?auth_error=… on the landing page.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("auth_error");
    if (code) {
      setMagic({
        status: "error",
        message: ERROR_MESSAGES[code] ?? ERROR_MESSAGES.oauth ?? "",
      });
    }
  }, []);

  const providerHref = (provider: SignInProvider) => {
    const query = new URLSearchParams();
    if (returnTo) query.set("return_to", returnTo);
    if (errorPath !== "/") query.set("error_path", errorPath);
    const queryString = query.toString();
    const suffix = queryString ? `?${queryString}` : "";
    return `${auth}/api/sign-in/${provider}${suffix}`;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const address = email.trim();
    if (!address) return;
    onMagicLinkSubmit?.();
    setMagic({ status: "sending" });
    const finish = new URL(`${auth}/api/auth/cross-app/finish`);
    finish.searchParams.set("return_to", returnTo ?? studioHomeUrl());
    const errorUrl = new URL(errorPath, window.location.origin);
    errorUrl.searchParams.set("auth_error", "magic_link");
    try {
      const res = await fetch(`${auth}/api/auth/sign-in/magic-link`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: address,
          callbackURL: finish.toString(),
          errorCallbackURL: errorUrl.toString(),
        }),
      });
      if (res.status === 429) {
        setMagic({
          status: "error",
          message: "Too many requests. Wait a minute and try again.",
        });
        return;
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        setMagic({
          status: "error",
          message:
            res.status === 400 && body?.message?.toLowerCase().includes("email")
              ? "Enter a valid email address."
              : "We couldn't send the link. Try again or use GitHub.",
        });
        return;
      }
      setMagic({ status: "sent", email: address });
    } catch {
      setMagic({
        status: "error",
        message: "We couldn't reach the server. Check your connection.",
      });
    }
  };

  const sending = magic.status === "sending";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <a
        href={providerHref("github")}
        onClick={() => {
          setRedirecting("github");
          onProviderClick?.("github");
        }}
        aria-disabled={redirecting !== null}
        data-testid="sign-in-github"
        className={cn(buttonVariants(), "w-full")}
      >
        <GithubMark aria-hidden />
        {redirecting === "github"
          ? "Redirecting to GitHub…"
          : "Continue with GitHub"}
      </a>
      {googleEnabled ? (
        <a
          href={providerHref("google")}
          onClick={() => {
            setRedirecting("google");
            onProviderClick?.("google");
          }}
          aria-disabled={redirecting !== null}
          data-testid="sign-in-google"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          <GoogleMark aria-hidden />
          {redirecting === "google"
            ? "Redirecting to Google…"
            : "Continue with Google"}
        </a>
      ) : null}

      <AuthDivider>OR</AuthDivider>

      <form
        onSubmit={(event) => void submit(event)}
        className="flex flex-col gap-2"
        data-testid="sign-in-magic-link"
        noValidate
      >
        <label htmlFor="sign-in-email" className="sr-only">
          Email address
        </label>
        <Input
          id="sign-in-email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          required
          value={email}
          disabled={sending}
          aria-invalid={magic.status === "error" ? true : undefined}
          aria-describedby="sign-in-email-status"
          onChange={(event) => {
            setEmail(event.target.value);
            if (magic.status === "error" || magic.status === "sent") {
              setMagic({ status: "idle" });
            }
          }}
        />
        <Button
          type="submit"
          variant="outline"
          className="relative w-full"
          disabled={sending || !email.trim()}
        >
          <span className={sending ? "invisible" : undefined}>
            {magic.status === "sent"
              ? "Send another link"
              : "Email me a sign-in link"}
          </span>
          {sending ? <Spinner className="absolute size-4" /> : null}
        </Button>
        <p
          id="sign-in-email-status"
          role="status"
          aria-live="polite"
          className={cn(
            "min-h-4 truncate text-xs",
            magic.status === "error"
              ? "text-destructive-foreground"
              : magic.status === "sent"
                ? "text-success-foreground"
                : "text-muted-foreground",
          )}
          title={
            magic.status === "sent"
              ? `Check ${magic.email} for your sign-in link.`
              : undefined
          }
        >
          {magic.status === "sent"
            ? `Check ${magic.email} for your sign-in link.`
            : magic.status === "error"
              ? magic.message
              : "We'll email you a link that signs you in. No password."}
        </p>
      </form>
    </div>
  );
}
