const principles = [
  {
    title: "Keep the structure visible",
    description:
      "Organizations contain projects, and each project can use its own project apps.",
  },
  {
    title: "Put access near the work",
    description:
      "Organization roles, team membership, and project grants help scope access to the work people do.",
  },
  {
    title: "Treat configuration as part of the project",
    description:
      "Environment variables belong to project environments. Values are encrypted at rest and masked in the interface.",
  },
];

export function AboutPrinciplesSection() {
  return (
    <section className="mt-10 md:mt-14" aria-labelledby="principles-heading">
      <h2
        id="principles-heading"
        className="mb-6 text-3xl font-medium tracking-[-0.04em] md:text-4xl"
      >
        How the product is organized
      </h2>
      <ul className="divide-border/70 border-foreground/15 divide-y border-y">
        {principles.map((item) => (
          <li
            key={item.title}
            className="grid gap-2 py-5 sm:grid-cols-[0.8fr_1.2fr] sm:gap-4 md:py-6"
          >
            <h3 className="text-base font-medium tracking-tight">
              {item.title}
            </h3>
            <p className="text-muted-foreground max-w-xl text-sm leading-6">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
