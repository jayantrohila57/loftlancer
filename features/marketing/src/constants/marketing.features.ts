import type { LucideIcon } from "lucide-react";
import { Activity, Boxes, KeyRound, Layers, Lock, Users } from "lucide-react";

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
    title: "Organizations, projects & project apps",
    description:
      "Organize teams and projects, install project apps, invite teammates, and control access with clear roles.",
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
    icon: KeyRound,
    title: "Passwordless sign-in",
    description:
      "Sign in with GitHub, Google, or a one-time email link. No password to manage.",
  },
];
