import { docsUrl } from "@features/shell/utils/shell.platform-urls.utils";
import { Button } from "@loftlancer/ui/button";

export function AboutLinksSection() {
  return (
    <section className="border-foreground/15 mt-10 grid gap-5 border-t pt-8 sm:grid-cols-[0.6fr_1.4fr] sm:items-center md:mt-14 md:pt-10">
      <h2 className="text-base font-medium">Learn and contribute</h2>
      <div className="flex flex-wrap items-center justify-between gap-5">
        <p className="text-muted-foreground max-w-2xl leading-7">
          Read the product documentation or explore the open source project on
          GitHub.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" render={<a href={docsUrl()} />}>
            Documentation
          </Button>
          <Button
            variant="outline"
            render={
              <a
                href="https://github.com/jayantrohila57/loftlancer"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            GitHub
          </Button>
        </div>
      </div>
    </section>
  );
}
