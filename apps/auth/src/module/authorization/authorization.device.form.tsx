"use client";

import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import { Field, FieldDescription, FieldLabel } from "@loftlancer/ui/field";
import { Auth5Panel } from "@loftlancer/ui/patterns/auth-5";
import { SignInOptions } from "@loftlancer/ui/patterns/sign-in-options";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { authAppReturnTo } from "@/lib/auth-return-to";
import { withBasePath } from "@/lib/base-path";
import { SegmentedCodeInput } from "@/module/authorization/authorization.device.code-input";
import { formatDeviceUserCode } from "@/module/authorization/authorization.device.utils";

export function DeviceCodeForm({ initialCode }: { initialCode: string }) {
  const router = useRouter();
  const [userCode, setUserCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const formatted = formatDeviceUserCode(userCode);
    if (!formatted) {
      setError("Enter the code shown in your terminal.");
      return;
    }

    const devicePath = `/device?user_code=${encodeURIComponent(formatted)}`;
    const returnTo = authAppReturnTo(devicePath);

    if (!session?.user) {
      window.location.assign(
        withBasePath(
          `/api/sign-in/github?return_to=${encodeURIComponent(returnTo)}`,
        ),
      );
      return;
    }

    setVerifying(true);
    try {
      const response = await authClient.device({
        query: { user_code: formatted },
      });
      if (response.error || !response.data) {
        setError("Invalid or expired code. Check your terminal and try again.");
        return;
      }
      router.push(
        `/device/approve?user_code=${encodeURIComponent(formatted)}` as Route,
      );
    } catch {
      setError("Invalid or expired code. Check your terminal and try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Auth5Panel layout="centered" showTerms={false}>
      <Card className="w-full border-0 bg-transparent shadow-none before:hidden">
        <CardHeader>
          <CardTitle>Device sign-in</CardTitle>
          <CardDescription>
            Enter the code from the Loftlancer CLI or another device. Only
            approve codes you requested on a device you control.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-4">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => void handleSubmit(e)}
          >
            <Field>
              <FieldLabel htmlFor="user_code">Device code</FieldLabel>
              <SegmentedCodeInput
                id="user_code"
                value={userCode}
                onChange={setUserCode}
                invalid={Boolean(error)}
                disabled={verifying}
              />
              <FieldDescription>
                Eight characters. Paste the whole code into any box.
              </FieldDescription>
            </Field>
            <p
              role="alert"
              className="-mt-2 min-h-4 text-destructive text-xs leading-4"
            >
              {error ?? ""}
            </p>

            {isPending ? (
              <p className="text-muted-foreground text-sm">Loading session…</p>
            ) : session?.user ? (
              <Button type="submit" size="sm" disabled={verifying}>
                {verifying ? "Verifying…" : "Continue"}
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground text-sm">
                  Sign in first, then verify your device code.
                </p>
                <SignInOptions
                  returnTo={authAppReturnTo(
                    `/device?user_code=${encodeURIComponent(formatDeviceUserCode(userCode))}`,
                  )}
                />
              </div>
            )}
          </form>

          <Button variant="outline" render={<Link href="/settings" />}>
            Back to account
          </Button>
        </CardPanel>
      </Card>
    </Auth5Panel>
  );
}
