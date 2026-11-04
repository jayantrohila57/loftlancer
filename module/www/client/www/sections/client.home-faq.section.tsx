import { FAQSection } from "@features/marketing/core/client";

const faq = [
  {
    question: "What can I organize in Loftlancer?",
    answer:
      "Create an organization, add projects, and invite teammates. Projects can use the Environments and Tasks apps.",
  },
  {
    question: "How does project access work?",
    answer:
      "Organization roles define membership access. Team membership and project grants can provide access to specific project work.",
  },
  {
    question: "How are environment variables protected?",
    answer:
      "Values are encrypted at rest and masked in the interface. A person must have permission to reveal or export them.",
  },
  {
    question: "Does Loftlancer connect to third-party project tools?",
    answer:
      "Not currently. GitHub, Google, and email are sign-in methods. The project apps available today are Environments and Tasks.",
  },
] as const;

export function HomeFaqSection() {
  return <FAQSection items={faq} />;
}
