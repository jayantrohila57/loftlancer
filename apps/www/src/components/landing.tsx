"use client";

import {
  Auth5Branding,
  Auth5Frame,
  Auth5Panel,
  SignInOptions,
} from "@features/authentication/core/client";
import { ModeToggle } from "@features/patterns/core/client/patterns.mode-toggle";
import { SiteFooter } from "@/components/site-footer";
import { trackEvent } from "@/lib/analytics";

export function Landing() {
  return (
    <div className="contents" data-testid="docs-landing">
      <Auth5Frame brandContent={<Auth5Branding />} brandFooter={<SiteFooter />}>
        <Auth5Panel
          title="Get started with Loftlancer"
          description="Organizations, projects, environments and encrypted variables for your team and your agents."
          topRight={<ModeToggle />}
        >
          {/* Passwordless only (#373): GitHub, Google and an email magic link. */}
          <SignInOptions
            errorPath="/sign-in"
            onProviderClick={(provider) =>
              trackEvent("sign_in_click", { method: provider })
            }
            onMagicLinkSubmit={() =>
              trackEvent("sign_in_click", { method: "email" })
            }
          />
        </Auth5Panel>
      </Auth5Frame>
    </div>
  );
}
