"use client";

import {
  Auth5Branding,
  Auth5Frame,
  Auth5Panel,
} from "@loftlancer/ui/patterns/auth-5";
import { SignInOptions } from "@loftlancer/ui/patterns/sign-in-options";
import { ModeToggle } from "@/components/mode-toggle";
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
