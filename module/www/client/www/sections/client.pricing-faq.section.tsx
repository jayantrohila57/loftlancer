import { FAQSection } from "@features/marketing/core/client";

const faq = [
  {
    q: "Is there a paid plan?",
    a: "No. Loftlancer is free during early access, and billing is not available.",
  },
  {
    q: "What is included?",
    a: "Organizations, projects, teams, access controls, encrypted environments, project activity, notifications, and the Environments and Tasks project apps are available during early access.",
  },
  {
    q: "Where can I review the source?",
    a: "The Loftlancer source is public on GitHub. The project documentation explains the product and its architecture.",
  },
  {
    q: "How do I sign in?",
    a: "Use GitHub, Google, or a one-time email link. Loftlancer creates an account when you sign in for the first time.",
  },
];

export function PricingFaqSection() {
  return (
    <FAQSection
      title="Pricing questions"
      description="Clear answers about the current offer and what exists in the product today."
      items={faq.map((item) => ({ question: item.q, answer: item.a }))}
    />
  );
}
