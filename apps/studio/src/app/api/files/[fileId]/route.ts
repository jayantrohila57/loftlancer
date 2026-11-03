import { createContextWithAuth } from "@loftlancer/orpc/core/orpc.create-context";
import { getPrivateFile } from "@modules/files/server/api/api.get-private-file";
import { requireActiveOrganization } from "@modules/organizations/server/service/server.org-access.service";
import { TRPCError } from "@trpc/server";
import { NextResponse } from "next/server";
import { siblingAuth } from "@/lib/sibling-auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const context = await createContextWithAuth(request as never, siblingAuth);
  if (!context.session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }
  try {
    const organizationId = await requireActiveOrganization(context.session);
    const { file, stream } = await getPrivateFile({
      userId: context.session.user.id,
      organizationId,
      fileId: (await params).fileId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
    return new Response(stream, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
        "Content-Type": file.contentType,
      },
    });
  } catch (error) {
    const status =
      error instanceof TRPCError && error.code === "FORBIDDEN" ? 403 : 404;
    return NextResponse.json({ error: "File not found" }, { status });
  }
}
