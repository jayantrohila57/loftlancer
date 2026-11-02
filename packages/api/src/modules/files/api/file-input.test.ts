import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileUploadRequestSchema, safeFilename } from "./file-input";

describe("file upload contract", () => {
  it("requires bounded metadata for a direct upload", () => {
    assert.equal(
      fileUploadRequestSchema.safeParse({
        projectId: "project-1",
        filename: "brief.pdf",
        contentType: "application/pdf",
        sizeBytes: 1024,
      }).success,
      true,
    );
    assert.equal(
      fileUploadRequestSchema.safeParse({
        projectId: "",
        filename: "brief.pdf",
        contentType: "application/pdf",
        sizeBytes: 0,
      }).success,
      false,
    );
  });

  it("removes path separators and unsafe filename characters", () => {
    assert.equal(safeFilename("../../private plan?.pdf"), "private-plan-.pdf");
  });
});
