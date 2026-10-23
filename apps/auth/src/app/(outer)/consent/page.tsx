import { Button } from "@loftlancer/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@loftlancer/ui/card";
import { Auth5Panel } from "@loftlancer/ui/patterns/auth-5";
import type { Metadata } from "next";
import Link from "next/link";
import { ConsentScreen } from "@/components/consent-screen";
import { authAppReturnTo } from "@/lib/auth-return-to";
import { verifyOAuthConsentSearchParams } from "@/lib/oauth-consent-query";

type SearchParams = Record<string, string | string[] | undefined>;

function toUrlSearchParams(resolved: SearchParams): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, entry);
      }
    }
  }
  return params;
}

function InvalidConsentRequest() {
  return (
    <Auth5Panel layout="centered" showTerms={false}>
      <Card className="w-full border-0 bg-transparent shadow-none before:hidden">
        <CardHeader>
          <CardTitle>Authorization request invalid</CardTitle>
          <CardDescription>
            This link is missing, expired, or was modified. Start again from the
            application that sent you here.
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <Button render={<Link href="/settings" />}>Back to account</Button>
        </CardPanel>
      </Card>
    </Auth5Panel>
  );
}

export const metadata: Metadata = { title: "Authorize access" };

export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const params = toUrlSearchParams(resolved);
  const verified = await verifyOAuthConsentSearchParams(params);

  if (!verified) {
    return <InvalidConsentRequest />;
  }

  const clientId = verified.get("client_id");
  if (!clientId) {
    return <InvalidConsentRequest />;
  }

  const consentReturnTo = authAppReturnTo(`/consent?${verified.toString()}`);

  return (
    <ConsentScreen
      clientId={clientId}
      scope={verified.get("scope")}
      claimsJson={verified.get("claims")}
      consentReturnTo={consentReturnTo}
    />
  );
}
