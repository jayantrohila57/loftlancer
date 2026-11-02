import { z } from "zod/v3";

export const fileUploadRequestSchema = z.object({
  projectId: z.string().min(1),
  filename: z.string().trim().min(1).max(180),
  contentType: z.string().trim().min(1).max(120),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024 * 1024),
});

export type FileUploadRequest = z.infer<typeof fileUploadRequestSchema>;

export function safeFilename(filename: string): string {
  const basename = filename.split(/[\\/]/).at(-1) ?? "upload";
  return (
    basename
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 120) || "upload"
  );
}
