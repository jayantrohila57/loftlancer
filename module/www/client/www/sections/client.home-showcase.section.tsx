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
        title="Projects stay connected to their organization."
        description="Group projects, project apps, environments, and access inside the organization that owns them. Teams can see where each resource lives and who can manage it."
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
        title="Permissions and environment values, with useful context."
        description="Organization roles, team membership, and project grants shape who can work on each project. Environment values are encrypted at rest and masked in the interface."
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
