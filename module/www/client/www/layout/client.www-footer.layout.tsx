import { VersionBadge } from "@features/patterns/core/client/patterns.version-badge";
import { SharedFooter } from "@modules/shared/layout/footer/client.footer.layout";
import { marketingSiteConfig } from "../../../utils/utils.site-config.constants";
import { wwwFooterGroups } from "../../../utils/utils.www-layout.constants";
import { WwwBrand } from "../components/client.www-brand.component";

export function WwwFooter() {
  return (
    <SharedFooter
      brand={
        <a href="/" aria-label="Loftlancer home">
          <WwwBrand inverse />
        </a>
      }
      description={marketingSiteConfig.description}
      groups={wwwFooterGroups}
      note="Loftlancer · Free during early access"
      trailing={
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-50/70 dark:text-neutral-100/70">
          <p>© {new Date().getFullYear()} Loftlancer</p>
          <VersionBadge />
        </div>
      }
    />
  );
}
