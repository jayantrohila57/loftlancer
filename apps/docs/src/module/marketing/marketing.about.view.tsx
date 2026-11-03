import { docsUrl } from "@features/shell/utils/shell.platform-urls.utils";

import { MarketingPage } from "@/components/marketing-page";

export default function AboutPage() {
  const docs = docsUrl();

  return (
    <MarketingPage
      title="About Loftlancer"
      description="A collaborative workspace for encrypted project configuration and team access."
    >
      <section aria-labelledby="mission">
        <h2 id="mission">One workspace for project operations</h2>
        <p>
          Loftlancer helps teams manage organizations, projects, people, and
          installable project apps together. It keeps the structure around work
          clear before people start managing the details.
        </p>
      </section>

      <section
        className="not-prose mt-8 grid gap-4 sm:grid-cols-2"
        aria-label="What Loftlancer manages"
      >
        <div className="bg-card text-card-foreground rounded-xl border p-5">
          <h2 className="text-base font-medium">
            Access that follows the workspace
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Organizations add members and teams, while roles and project access
            define what each person can view or change.
          </p>
        </div>
        <div className="bg-card text-card-foreground rounded-xl border p-5">
          <h2 className="text-base font-medium">Protected configuration</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Environment values are encrypted at rest and masked until an
            authorized person chooses to reveal them.
          </p>
        </div>
      </section>

      <section>
        <h2>Learn and contribute</h2>
        <p>
          Read the <a href={docs}>documentation</a> to get started, or explore
          the open source code on{" "}
          <a
            href="https://github.com/jayantrohila57/loftlancer"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </section>
    </MarketingPage>
  );
}
