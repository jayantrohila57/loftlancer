import { studioHomeUrl } from "@loftlancer/ui/auth-links";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { BookOpenIcon } from "lucide-react";

const GITHUB_REPO = "https://github.com/jayantrohila57/loftlancer";

function _studioUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_STUDIO_URL?.trim() ??
    "https://loftlancer.com/studio";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <BookOpenIcon className="size-5 text-primary" />
          <span className="font-semibold">Loftlancer Docs</span>
        </>
      ),
    },
    links: [
      {
        type: "button",
        text: "Dashboard",
        url: studioHomeUrl(),
        external: true,
      },
      {
        type: "button",
        text: "Sign in",
        // The landing page holds the GitHub, Google and email options (#373).
        url: "/",
      },
    ],
    githubUrl: GITHUB_REPO,
  };
}
