"use client";

import { marketingFeatures } from "@loftlancer/ui/marketing";
import { Auth5Frame, Auth5Panel } from "@loftlancer/ui/patterns/auth-5";
import { SignInOptions } from "@loftlancer/ui/patterns/sign-in-options";
import { ModeToggle } from "@/components/mode-toggle";
import { SiteFooter } from "@/components/site-footer";
import { trackEvent } from "@/lib/analytics";

function LandingBranding() {
  return (
    <section
      aria-label="Loftlancer features"
      className="mx-auto w-full max-w-lg space-y-6"
    >
      <div className="space-y-3">
        <h2 className="font-heading font-semibold text-2xl tracking-tight xl:text-3xl">
          One workspace for your team and your agents.
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Bring your projects, people, and environments together with clear
          access and a shared history of changes.
        </p>
      </div>
      <ul className="space-y-3">
        {marketingFeatures.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex gap-3">
            <Icon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
            <div className="space-y-1">
              <h3 className="font-medium text-sm">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Landing() {
  return (
    <div className="contents" data-testid="docs-landing">
      <Auth5Frame
        brandContent={<LandingBranding />}
        brandFooter={<SiteFooter />}
      >
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
