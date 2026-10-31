import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

const GITHUB_REPO = "https://github.com/jayantrohila57/loftlancer";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="font-medium font-mono text-[10px] uppercase tracking-[0.14em]">
          Documentation
        </span>
      ),
    },
    githubUrl: GITHUB_REPO,
  };
}
