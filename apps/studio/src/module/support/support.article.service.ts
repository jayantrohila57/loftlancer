import "server-only";

import { studioRouter } from "@loftlancer/api/routers/studio";
import { TRPCError } from "@trpc/server";

export async function getSupportArticle(slug: string) {
  try {
    return await studioRouter
      .createCaller({ session: null })
      .support.getFaqBySlug({ slug });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") return null;
    throw error;
  }
}

export type SupportArticle = NonNullable<
  Awaited<ReturnType<typeof getSupportArticle>>
>;

export async function getSupportArticles() {
  return studioRouter.createCaller({ session: null }).support.listFaqPublic();
}

export type SupportArticles = Awaited<ReturnType<typeof getSupportArticles>>;
