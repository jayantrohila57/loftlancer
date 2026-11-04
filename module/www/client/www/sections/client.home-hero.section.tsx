import { ProductPreview } from "@features/marketing/core/client";
import { marketingContainerClass } from "@features/shell/utils/shell.layout-spacing.utils";
import { Button } from "@loftlancer/ui/button";
import { cn } from "@loftlancer/ui/utils";
import Image from "next/image";
import { marketingSiteConfig } from "../../../utils/utils.site-config.constants";

export function HomeHeroSection({
  signInHref,
  pagesBaseUrl,
}: {
  signInHref: string;
  pagesBaseUrl?: string;
}) {
  const [headlineLead = marketingSiteConfig.tagline, headlineTail] =
    marketingSiteConfig.tagline.split(", and ");
  const featuresHref = pagesBaseUrl
    ? new URL("features", `${pagesBaseUrl.replace(/\/$/, "")}/`).toString()
    : "/features";
  return (
    <section className="border-foreground/15 border-b">
      <div
        className={cn(marketingContainerClass, "pt-9 pb-8 md:pt-14 md:pb-10")}
      >
        <div className="grid gap-7 md:grid-cols-[minmax(0,1.25fr)_minmax(15rem,0.75fr)] md:items-end md:gap-12">
          <h1
            className="max-w-4xl text-[clamp(3.25rem,5.2vw,5.4rem)] leading-[0.96] font-medium tracking-[-0.04em] text-balance"
            data-testid="marketing-hero-title"
          >
            <span className="block">{headlineLead},</span>
            {headlineTail ? (
              <>
                {" "}
                <span className="block">and {headlineTail}</span>
              </>
            ) : null}
          </h1>
          <div className="max-w-md pb-1 md:justify-self-end">
            <p className="text-muted-foreground text-base leading-7 text-pretty md:text-lg">
              {marketingSiteConfig.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Button
                size="lg"
                render={<a href={signInHref} />}
                data-testid="marketing-cta-get-started"
              >
                Open your workspace
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<a href={featuresHref} />}
              >
                Explore features
              </Button>
            </div>
            <p className="text-muted-foreground mt-3 text-sm">
              Free during early access. No paid plans are available.
            </p>
          </div>
        </div>
      </div>
      <div className={cn(marketingContainerClass, "pb-8 md:pb-10")}>
        <ProductPreview
          label="Loftlancer Studio / Organization overview"
          note="A view from the product"
        >
          <Image
            alt="Loftlancer Studio showing an organization workspace and project navigation."
            className="h-auto w-full"
            height={1108}
            priority
            sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1200px) calc(100vw - 3rem), 1152px"
            src="/studio-overview.jpg"
            width={2010}
          />
        </ProductPreview>
      </div>
    </section>
  );
}
