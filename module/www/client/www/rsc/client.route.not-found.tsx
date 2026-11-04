import { MarketingRouteState } from "@modules/www/client/www/components/client.route-state.component";
import WwwLayout from "../layout/client.www.layout";

export default function NotFound() {
  return (
    <WwwLayout>
      <MarketingRouteState
        code="404"
        title="This page isn’t here."
        description="The address may have changed, or the page may no longer exist. Head back to the Loftlancer home page to find your way around."
        actionHref="/"
        actionLabel="Back to home"
        secondaryHref="/docs"
        secondaryLabel="Read the docs"
      />
    </WwwLayout>
  );
}
