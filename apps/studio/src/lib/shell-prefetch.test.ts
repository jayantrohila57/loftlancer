import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isReservedOrgSlugForCreation } from "@loftlancer/env/reserved-slugs";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { orgSlugFromRequestPath } from "./org-slug-from-request-path";

describe("orgSlugFromRequestPath", () => {
  it("returns the first segment for org routes", () => {
    assert.equal(orgSlugFromRequestPath("/acme/projects"), "acme");
  });

  it("returns null for reserved and empty paths", () => {
    assert.equal(orgSlugFromRequestPath("/notifications"), null);
    assert.equal(orgSlugFromRequestPath("/"), null);
  });

  it("does not treat the organizations directory query as an org scope", () => {
    assert.equal(
      orgSlugFromRequestPath("/organizations", "?directory=1"),
      null,
    );
    assert.equal(orgSlugFromRequestPath("/organizations"), "organizations");
    assert.equal(
      orgSlugFromRequestPath("/organizations/projects", "?directory=1"),
      "organizations",
    );
  });

  it("reserves the directory slug for new organizations while keeping legacy routing", () => {
    assert.equal(isReservedOrgSlugForCreation("organizations"), true);
    assert.equal(orgSlugFromRequestPath("/organizations"), "organizations");
  });
});

describe("sidebar navigator shell prefetch", () => {
  it("does not throw when navigator prefetch fails (client refetch fallback)", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await Promise.allSettled([
      queryClient.fetchQuery({
        queryKey: ["sidebar", "navigator", { orgSlug: "acme" }],
        queryFn: async () => {
          throw new Error("navigator down");
        },
      }),
    ]);

    assert.ok(dehydrate(queryClient));
  });
});
