import { docsUrl } from "@features/shell/utils/shell.platform-urls.utils";
import { MarketingRouteState } from "@modules/www/client/www/components/client.route-state.component";
import WwwLayout from "../layout/client.www.layout";

export default function NotFound() {
  return (
    <WwwLayout>
      <MarketingRouteState
        code="404"
        title="This page isn’t here."
        description="The address may have changed, or the page may no longer exist. Return home or browse the Loftlancer documentation."
        actionHref="/"
        actionLabel="Back to home"
        secondaryHref={docsUrl()}
        secondaryLabel="Read the docs"
      />
    </WwwLayout>
  );
}
