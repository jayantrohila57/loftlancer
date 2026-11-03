"use client";

import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { orgAc, orgBetterAuthRoles } from "@features/authorization/utils";
import {
  adminClient,
  deviceAuthorizationClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { CreateLoftlancerAuthClientOptions } from "../types/better-auth-client.options.types";
import { resolveBetterAuthClientApiBaseURL } from "../utils/better-auth-client.resolve-api-base-url";

export function createLoftlancerAuthClient(
  options: CreateLoftlancerAuthClientOptions = {},
) {
  const {
    baseURL,
    organizationsEnabled = false,
    adminEnabled = true,
    platformOAuth = false,
  } = options;

  const plugins = [];
  if (adminEnabled) {
    plugins.push(adminClient());
  }
  if (platformOAuth) {
    plugins.push(oauthProviderClient(), deviceAuthorizationClient());
  }
  if (organizationsEnabled) {
    plugins.push(
      organizationClient({
        ac: orgAc,
        roles: orgBetterAuthRoles,
      }),
    );
  }

  const apiBaseURL = resolveBetterAuthClientApiBaseURL(baseURL);

  return createAuthClient({
    ...(apiBaseURL ? { baseURL: apiBaseURL } : {}),
    plugins,
  });
}

export type LoftlancerAuthClient = ReturnType<
  typeof createLoftlancerAuthClient
>;
