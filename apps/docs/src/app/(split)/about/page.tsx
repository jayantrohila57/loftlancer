import { docsUrl } from "@loftlancer/ui/platform-urls";

import { MarketingPage } from "@/components/marketing-page";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "A collaborative workspace for encrypted project configuration and team access.",
  path: "/about",
});

export default function AboutPage() {
  const docs = docsUrl();

  return (
    <MarketingPage
      title="About Loftlancer"
      description="A collaborative workspace for encrypted project configuration and team access."
    >
      <p>
        Loftlancer helps teams store configuration and secrets per project and
        environment. Values are encrypted at rest; the UI masks secrets until an
        authorized user reveals them. Organizations add members, teams, and
        fine-grained project access on top of owner / manager / member roles.
      </p>
      <p>
        Manage organizations, projects, teams, and applications together. See
        the <a href={docs}>documentation</a> to learn how to get started.
      </p>
      <p>
        Source code is open on{" "}
        <a
          href="https://github.com/jayantrohila57/loftlancer"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </p>
    </MarketingPage>
  );
}
