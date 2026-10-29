import { pageMetadata } from "@/lib/seo";
import AboutPage from "@/module/marketing/marketing.about.view";

export const metadata = pageMetadata({
  title: "About",
  description:
    "A collaborative workspace for encrypted project configuration and team access.",
  path: "/about",
});

export default function AboutPageRoute() {
  return <AboutPage />;
}
