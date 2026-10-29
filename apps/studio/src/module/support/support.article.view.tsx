import DashboardSection from "@/components/section-dashboard";
import type { SupportArticle } from "./support.article.service";

export function SupportArticleView({ article }: { article: SupportArticle }) {
  return (
    <DashboardSection
      title={article.title}
      description={article.category}
      back={false}
    >
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {article.body}
      </div>
    </DashboardSection>
  );
}
