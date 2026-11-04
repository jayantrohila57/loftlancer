import { FAQSection } from "@features/marketing/core/client";

const faq = [
  {
    q: "Is there a paid plan?",
    a: "No. Billing is not available, so there is nothing to buy and no card is requested. If plans change, this page and the docs will be updated before any charge applies.",
  },
  { q: "Are there usage limits?", a: "No plan limits are enforced today." },
  {
    q: "Can I self-host?",
    a: "Yes. The source is public on GitHub, and the documentation covers deploying it with Vercel and Neon Postgres.",
  },
  {
    q: "How do I sign in?",
    a: "Use GitHub, Google, or a one-time email link. Your account is created when you sign in for the first time.",
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
