import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { docsUrl } from "../src/utils/shell.platform-urls.utils";

describe("docsUrl", () => {
  it("points at /docs, not the landing root (#312)", () => {
    const prev = process.env.NEXT_PUBLIC_DOCS_URL;
    process.env.NEXT_PUBLIC_DOCS_URL = "https://example.com/";
    try {
      assert.equal(docsUrl(), "https://example.com/docs");
      assert.equal(docsUrl("/cli"), "https://example.com/docs/cli");
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_DOCS_URL;
      else process.env.NEXT_PUBLIC_DOCS_URL = prev;
    }
  });
});
