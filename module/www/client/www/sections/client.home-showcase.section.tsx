import {
  FeatureShowcase,
  PageContainer,
  ProductPreview,
} from "@features/marketing/core/client";
import Image from "next/image";

export function HomeShowcaseSection() {
  return (
    <PageContainer>
      <FeatureShowcase
        title="Give every project a clear place."
        description="Projects belong to an organization. Add the Environments or Tasks app to a project, then manage its work and access in that project context."
        visual={
          <ProductPreview
            label="Loftlancer Studio / Projects"
            note="Organization and project view"
          >
            <Image
              alt="Loftlancer Studio projects page with organization navigation and project list."
              className="h-auto w-full"
              height={1108}
              sizes="(max-width: 767px) calc(100vw - 2rem), 680px"
              src="/studio-projects.jpg"
              width={2010}
            />
          </ProductPreview>
        }
      />
      <FeatureShowcase
        reverse
        title="Keep configuration within project access."
        description="Organization roles, team membership, and project grants determine who can work in a project. Environment values are encrypted at rest and masked in the interface."
        visual={
          <ProductPreview
            label="Loftlancer Studio / Access"
            note="Role and project permissions"
          >
            <Image
              alt="Loftlancer Studio access settings showing organization roles and project permissions."
              className="h-auto w-full"
              height={1108}
              sizes="(max-width: 767px) calc(100vw - 2rem), 680px"
              src="/studio-access.jpg"
              width={2010}
            />
          </ProductPreview>
        }
      />
    </PageContainer>
  );
}
