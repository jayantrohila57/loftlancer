import DashboardSection from "@/components/section-dashboard";
import type { SupportArticle } from "./support.article.service";

export function SupportArticleView({ article }: { article: SupportArticle }) {
  return (
    <DashboardSection
      title={article.title}
      description={article.category}
      back={false}
    >
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {article.body}
      </div>
    </DashboardSection>
  );
}
