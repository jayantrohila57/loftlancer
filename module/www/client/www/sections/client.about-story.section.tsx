export function AboutStorySection() {
  return (
    <section className="border-foreground/15 grid gap-5 border-b pb-10 md:grid-cols-[0.6fr_1.4fr] md:gap-12 md:pb-14">
      <div className="max-w-3xl md:col-start-2">
        <p className="text-2xl leading-snug font-medium tracking-[-0.035em] text-pretty md:text-3xl">
          Project work touches people, permissions, environments, and tools.
          Loftlancer gives those pieces a shared home.
        </p>
        <p className="text-muted-foreground mt-5 max-w-2xl leading-7">
          The product is built for teams that want to keep operational context
          close to the projects they work on, with clear ownership and access
          along the way.
        </p>
      </div>
    </section>
  );
}
