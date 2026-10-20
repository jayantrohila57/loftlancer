"use client";

import { appRegistry } from "@loftlancer/actions/apps";
import { buttonVariants } from "@loftlancer/ui/button";
import { Auth5Panel } from "@loftlancer/ui/patterns/auth-5";
import { SignInOptions } from "@loftlancer/ui/patterns/sign-in-options";
import { ModeToggle } from "@/components/mode-toggle";
import { SiteFooter } from "@/components/site-footer";
import { trackEvent } from "@/lib/analytics";

export function Landing() {
  return (
    <div className="contents" data-testid="docs-landing">
      <Auth5Panel
        title="Get started with Loftlancer"
        description="Organizations, projects, environments and encrypted variables for your team and your agents."
        topLeft={
          <a href="/docs" className={buttonVariants({ variant: "ghost" })}>
            Docs
          </a>
        }
        topRight={<ModeToggle />}
        footer={<SiteFooter className="pt-2" />}
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
        <ul className="mt-4 flex flex-col divide-y divide-border/60 rounded-xl text-left ring-1 ring-border/60">
          {appRegistry.map((app) => (
            <li key={app.id} className="flex flex-col gap-0.5 px-3 py-2">
              <span className="flex items-center gap-1.5 font-medium text-sm">
                {app.name}
                <span className="rounded-sm bg-muted px-1 text-muted-foreground text-xs">
                  App
                </span>
              </span>
              <span className="text-muted-foreground text-xs">
                {app.description}
              </span>
            </li>
          ))}
          <li className="flex flex-col gap-0.5 px-3 py-2">
            <span className="font-medium text-sm">Roles and permissions</span>
            <span className="text-muted-foreground text-xs">
              Owner, manager and member roles, with per-project grants, checked
              on every request.
            </span>
          </li>
        </ul>
      </Auth5Panel>
    </div>
  );
}
