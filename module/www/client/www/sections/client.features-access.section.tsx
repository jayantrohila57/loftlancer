import { ProductPreview } from "@features/marketing/core/client";
import Image from "next/image";

export function FeaturesAccessSection() {
  return (
    <section id="access" className="mt-16 scroll-mt-28 md:mt-20">
      <div className="border-foreground/15 grid gap-8 border-t pt-8 md:grid-cols-[0.78fr_1.22fr] md:gap-12">
        <div>
          <h2 className="text-3xl font-medium tracking-[-0.04em] text-balance md:text-4xl">
            Give every person access for their work.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg leading-7">
            Organization roles set the baseline. Team membership and per-project
            grants extend access where a project needs it. Activity history
            helps teams review important changes.
          </p>
        </div>
        <ProductPreview
          label="Loftlancer Studio / Access settings"
          note="Organization roles and project permissions"
        >
          <Image
            alt="Loftlancer Studio access settings showing organization roles and project permissions."
            className="h-auto w-full"
            height={1108}
            sizes="(max-width: 767px) calc(100vw - 2rem), 700px"
            src="/studio-access.jpg"
            width={2010}
          />
        </ProductPreview>
      </div>
    </section>
  );
}
