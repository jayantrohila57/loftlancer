import { docsUrl } from "@features/shell/utils/shell.platform-urls.utils";

export const wwwPrimaryLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: docsUrl(), label: "Documentation" },
] as const;

export const wwwFooterGroups = [
  {
    label: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
    ],
  },
  {
    label: "Learn",
    links: [
      { href: docsUrl(), label: "Documentation" },
      { href: "/changelog", label: "Changelog" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    label: "Trust",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/legal/contact", label: "Contact" },
      { href: "/legal/security", label: "Security" },
    ],
  },
  {
    label: "Policies",
    links: [
      { href: "/legal/cookies", label: "Cookies" },
      { href: "/legal/dpa", label: "DPA" },
      { href: "/legal/acceptable-use", label: "Acceptable use" },
    ],
  },
] as const;
