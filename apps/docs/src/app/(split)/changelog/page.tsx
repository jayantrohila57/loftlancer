import { loadChangelog } from "@/lib/changelog";
import { pageMetadata } from "@/lib/seo";
import { ChangelogView } from "@/module/marketing/marketing.changelog.view";

export const metadata = pageMetadata({
  title: "Changelog",
  description:
    "Every Loftlancer release, from the first env-manager commit to today, with what was added, changed and fixed.",
  path: "/changelog",
});

export default async function ChangelogPage() {
  const releases = (await loadChangelog()).filter((release) => release.date);
  return <ChangelogView releases={releases} />;
}
