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
import { CircleCheckIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  OAuthDecisionButtons,
  OAuthScopeCard,
} from "@/components/oauth-scope-card";
import { SegmentedCodeInput } from "@/components/segmented-code-input";
import { authClient } from "@/lib/auth-client";
import { authAppReturnTo } from "@/lib/auth-return-to";
import { withBasePath } from "@/lib/base-path";
import { formatDeviceUserCode } from "@/lib/format-user-code";

type DeviceRequest = {
  client_id?: string;
  scope?: string;
  resource?: string | string[];
  user_code?: string;
};

type DeviceApprovalScreenProps = {
  userCode: string;
};

export function DeviceApprovalScreen({ userCode }: DeviceApprovalScreenProps) {
  const formattedCode = formatDeviceUserCode(userCode);
  const { data: session, isPending } = authClient.useSession();
  const [request, setRequest] = useState<DeviceRequest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"approve" | "deny" | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      const returnTo = authAppReturnTo(
        `/device/approve?user_code=${encodeURIComponent(formattedCode)}`,
      );
      window.location.assign(
        withBasePath(
          `/api/sign-in/github?return_to=${encodeURIComponent(returnTo)}`,
        ),
      );
      return;
    }
    let cancelled = false;
    void authClient
      .device({ query: { user_code: formattedCode } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) {
          setLoadError("This code is invalid or expired.");
          return;
        }
        setRequest(data as DeviceRequest);
      });
    return () => {
      cancelled = true;
    };
  }, [formattedCode, isPending, session?.user]);

  const resources = request?.resource
    ? Array.isArray(request.resource)
      ? request.resource
      : [request.resource]
    : [];

  const handleApprove = async () => {
    setSubmitting("approve");
    setLoadError(null);
    try {
      const { error } = await authClient.device.approve({
        userCode: formattedCode,
      });
      if (error) {
        setLoadError("Could not approve this device. Try again.");
        return;
      }
      setDoneMessage(
        "Device approved. You can return to your terminal or device.",
      );
    } catch {
      setLoadError("Could not approve this device. Try again.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeny = async () => {
    setSubmitting("deny");
    setLoadError(null);
    try {
      const { error } = await authClient.device.deny({
        userCode: formattedCode,
      });
      if (error) {
        setLoadError("Could not deny this request. Try again.");
        return;
      }
      setDoneMessage("Request denied. The device will not be signed in.");
    } catch {
      setLoadError("Could not deny this request. Try again.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Auth5Panel layout="centered" showTerms={false}>
      <Card className="w-full border-0 bg-transparent shadow-none before:hidden">
        <CardHeader>
          <CardTitle>Approve device</CardTitle>
          <CardDescription>
            Confirm this code matches what your device is showing. Approve only
            if you started this sign-in on a device you own.
          </CardDescription>
        </CardHeader>
        <CardPanel className="flex flex-col gap-3">
          <SegmentedCodeInput
            value={formattedCode}
            onChange={() => {}}
            readOnly
          />
          {doneMessage ? (
            <div className="flex items-center gap-2 rounded-md p-4 text-sm ring-1 ring-border/60">
              <CircleCheckIcon aria-hidden className="size-4 text-primary" />
              {doneMessage}
            </div>
          ) : (
            <>
              <OAuthScopeCard
                appName={
                  request ? (request.client_id ?? "Unknown client") : null
                }
                appMeta={
                  resources.length > 0
                    ? `Resource ${resources.join(", ")}`
                    : null
                }
                scope={request?.scope ?? null}
              />
              <OAuthDecisionButtons
                submitting={submitting}
                disabled={!request}
                approveLabel="Approve"
                onApprove={() => void handleApprove()}
                onDeny={() => void handleDeny()}
              />
            </>
          )}
          <p
            role="alert"
            className="min-h-4 text-destructive text-xs leading-4"
          >
            {loadError ?? ""}
          </p>
          <Button variant="ghost" size="sm" render={<Link href="/device" />}>
            Enter a different code
          </Button>
        </CardPanel>
      </Card>
    </Auth5Panel>
  );
}
