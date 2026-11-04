"use client";

import { trackAnalyticsEvent } from "@features/analytics/core/client";
import {
  Auth5Branding,
  Auth5Frame,
  Auth5Panel,
  SignInOptions,
} from "@features/authentication/core/client";
import { ModeToggle } from "@features/patterns/core/client/patterns.mode-toggle";
import { SiteFooter } from "@modules/www/client/www/components/client.sign-in.footer.component";
import { marketingSiteConfig } from "@modules/www/utils/utils.site-config.constants";

export function Landing() {
  return (
    <div className="contents" data-testid="docs-landing">
      <Auth5Frame brandContent={<Auth5Branding />} brandFooter={<SiteFooter />}>
        <Auth5Panel
          title="Get started with Loftlancer"
          description={marketingSiteConfig.description}
          topRight={<ModeToggle />}
        >
          {/* Passwordless only (#373): GitHub, Google and an email magic link. */}
          <SignInOptions
            errorPath="/sign-in"
            onProviderClick={(provider) =>
              trackAnalyticsEvent("sign_in_click", { method: provider })
            }
            onMagicLinkSubmit={() =>
              trackAnalyticsEvent("sign_in_click", { method: "email" })
            }
          />
        </Auth5Panel>
      </Auth5Frame>
    </div>
  );
}
