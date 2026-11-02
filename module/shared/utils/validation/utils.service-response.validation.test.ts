import assert from "node:assert/strict";
import { test } from "node:test";
import { z } from "zod";
import {
  createError,
  createFailed,
  createSuccess,
  serviceResponseSchema,
} from "./utils.service-response.validation";

test("canonical response schema distinguishes empty, rejection, and system failure", () => {
  const schema = serviceResponseSchema(z.object({ id: z.string() }));
  assert.equal(
    schema.parse(createSuccess([], "No teams yet")).status,
    "success",
  );
  assert.equal(schema.parse(createFailed("Not allowed")).data, null);
  assert.equal(
    schema.parse(createError("Try again", { code: "DB_ERROR" })).status,
    "error",
  );
  assert.equal(
    schema.safeParse({ status: "error", data: null, message: "Broken" })
      .success,
    false,
  );
  assert.equal(
    schema.safeParse({
      status: "failed",
      data: { id: "secret" },
      message: "Denied",
    }).success,
    false,
  );
});
