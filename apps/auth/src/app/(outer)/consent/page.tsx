import type { Metadata } from "next";
import { authAppReturnTo } from "@/lib/auth-return-to";
import { InvalidConsentRequest } from "@/module/authorization/authorization.consent.invalid";
import { ConsentScreen } from "@/module/authorization/authorization.consent.screen";
import { verifyOAuthConsentSearchParams } from "@/module/authorization/authorization.consent.service";

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
