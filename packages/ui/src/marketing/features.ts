import type { LucideIcon } from "lucide-react";
import { Activity, Boxes, Layers, Lock, Users } from "lucide-react";
import { GithubIcon } from "../components/icons/github-icon";

export type MarketingFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const marketingFeatures: MarketingFeature[] = [
  {
    icon: Lock,
    title: "Encrypted at rest",
    description:
      "Secrets are encrypted in the database and masked in the UI until you choose to reveal them.",
  },
  {
    icon: Layers,
    title: "Per-environment targets",
    description:
      "Dev, staging, and production variables live in one project—with clear separation.",
  },
  {
    icon: Boxes,
    title: "Organizations, projects & apps",
    description:
      "Group work, connect apps, invite teammates, and control access with clear roles.",
  },
  {
    icon: Users,
    title: "People & access",
    description:
      "Manage organization, project, and team membership with roles that match each resource.",
  },
  {
    icon: Activity,
    title: "Activity",
    description:
      "See who changed what with an audit-style feed across your workspace.",
  },
  {
    icon: GithubIcon,
    title: "GitHub sign-in",
    description:
      "Sign in with GitHub, Google or an email link. No passwords to rotate or forget.",
  },
];
