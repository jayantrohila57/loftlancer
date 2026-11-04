export function AboutStorySection() {
  return (
    <section className="border-foreground/15 grid gap-5 border-b pb-10 md:grid-cols-[0.6fr_1.4fr] md:gap-12 md:pb-14">
      <div className="max-w-3xl md:col-start-2">
        <p className="text-2xl leading-snug font-medium tracking-[-0.035em] text-pretty md:text-3xl">
          Project work brings people, access, configuration, and tasks together.
          Loftlancer gives a team one place to organize that work.
        </p>
        <p className="text-muted-foreground mt-5 max-w-2xl leading-7">
          Start with an organization, add projects, and choose the project apps
          your team needs. Access follows the organization and project
          membership you assign.
        </p>
      </div>
    </section>
  );
}
