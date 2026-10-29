import Link from "next/link";
import DashboardSection from "@/components/section-dashboard";
import { routes } from "@/utils/navigation";

export default function SupportArticleNotFound() {
  return (
    <DashboardSection title="Article not found" back={false}>
      <p className="text-muted-foreground text-sm">
        This article could not be found. Return to the{" "}
        <Link className="underline" href={routes.supportHelp()}>
          help center
        </Link>
        .
      </p>
    </DashboardSection>
  );
}
