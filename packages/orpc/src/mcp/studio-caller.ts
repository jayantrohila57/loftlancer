import { activeUserWhere, db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import { eq } from "drizzle-orm";
import { studioRouter } from "../routers/studio";

export type McpStudioCaller = ReturnType<typeof studioRouter.createCaller>;

export async function createMcpStudioCaller(options: {
  userId: string;
  organizationId?: string | null;
}): Promise<McpStudioCaller> {
  const [userRow] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(activeUserWhere(eq(user.id, options.userId)))
    .limit(1);

  if (!userRow) {
    throw new Error("user_not_found");
  }

  const now = new Date();
  const session = {
    user: {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      image: userRow.image,
      emailVerified: userRow.emailVerified,
      createdAt: userRow.createdAt,
      updatedAt: userRow.updatedAt,
    },
    session: {
      id: `mcp-session-${userRow.id}`,
      userId: userRow.id,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      token: `mcp-${userRow.id}`,
      createdAt: now,
      updatedAt: now,
      ipAddress: null,
      userAgent: "loftlancer-mcp",
      activeOrganizationId: options.organizationId ?? null,
    },
  };

  return studioRouter.createCaller({ session });
}
