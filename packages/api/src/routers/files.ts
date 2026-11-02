import { z } from "zod/v3";
import { orgProcedure, router } from "../index";
import { completeFileUpload } from "../modules/files/api/api.complete-file-upload";
import { createFileUpload } from "../modules/files/api/api.create-file-upload";
import { deleteFile } from "../modules/files/api/api.delete-file";
import { listFiles } from "../modules/files/api/api.list-files";
import { fileUploadRequestSchema } from "../modules/files/api/file-input";

function fileContext(
  ctx: {
    session: { user: { id: string } };
    activeOrganizationId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
  projectId: string,
) {
  if (!ctx.activeOrganizationId)
    throw new Error("Active organization required");
  return {
    userId: ctx.session.user.id,
    organizationId: ctx.activeOrganizationId,
    projectId,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  };
}

export const filesRouter = router({
  list: orgProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .query(({ ctx, input }) => listFiles(fileContext(ctx, input.projectId))),
  createUpload: orgProcedure
    .input(fileUploadRequestSchema)
    .mutation(({ ctx, input }) =>
      createFileUpload(fileContext(ctx, input.projectId), input),
    ),
  completeUpload: orgProcedure
    .input(
      z.object({ projectId: z.string().min(1), fileId: z.string().uuid() }),
    )
    .mutation(({ ctx, input }) =>
      completeFileUpload(fileContext(ctx, input.projectId), input.fileId),
    ),
  delete: orgProcedure
    .input(
      z.object({ projectId: z.string().min(1), fileId: z.string().uuid() }),
    )
    .mutation(({ ctx, input }) =>
      deleteFile(fileContext(ctx, input.projectId), input.fileId),
    ),
});
