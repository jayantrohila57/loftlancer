import { notFound } from "next/navigation";
import { getSupportArticle } from "@/module/support/support.article.service";
import { SupportArticleView } from "@/module/support/support.article.view";

export default async function SupportHelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getSupportArticle(slug);
  if (!article) notFound();
  return <SupportArticleView article={article} />;
}
