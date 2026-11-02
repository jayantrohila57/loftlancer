import "server-only";

import { verifyOAuthQueryParams } from "@better-auth/oauth-provider";
import { platformAuth } from "@/lib/platform-auth";

export async function verifyOAuthConsentSearchParams(
  searchParams: URLSearchParams,
): Promise<URLSearchParams | null> {
  const query = searchParams.toString();
  if (!query) {
    return null;
  }
  const { secret } = await platformAuth.$context;
  if (!(await verifyOAuthQueryParams(query, secret))) {
    return null;
  }
  return new URLSearchParams(query);
}
