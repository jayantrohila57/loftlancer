import { FAQSection } from "@features/marketing/core/client";

const faq = [
  {
    question: "Where do I start?",
    answer:
      "Sign in, then create or join an organization. From there, you can create projects and invite members.",
  },
  {
    question: "How does project access work?",
    answer:
      "Organization roles set workspace access. Teams and project grants can extend access for the projects where people need to work.",
  },
  {
    question: "How are environment variables protected?",
    answer:
      "Values are encrypted at rest and masked in the interface. People with the right access can reveal them when needed.",
  },
  {
    question: "Can I connect other tools?",
    answer:
      "Additional compatible tool integrations are planned. They are not available as product integrations today.",
  },
] as const;

export function HomeFaqSection() {
  return <FAQSection items={faq} />;
}
