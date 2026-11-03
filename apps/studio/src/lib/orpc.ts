"use client";
import type { StudioORPCRouter } from "@loftlancer/api/orpc";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { withBasePath } from "./base-path";
/** Single typed browser entrypoint for module hooks. */
export const studioORPC: RouterClient<StudioORPCRouter> = createORPCClient(
  new RPCLink({
    url: withBasePath("/api/orpc") as `/${string}`,
    origin: () => window.location.origin,
  }),
);
