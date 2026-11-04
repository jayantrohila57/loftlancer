const links = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "Project apps", href: "#project-apps" },
  { label: "Access", href: "#access" },
] as const;

export function FeaturesIndexSection() {
  return (
    <nav
      aria-label="On this page"
      className="border-foreground/15 border-t pt-4"
    >
      <h2 className="text-sm font-medium">On this page</h2>
      <ul className="mt-3 grid gap-1">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-muted-foreground hover:text-foreground hover:decoration-border inline-flex min-h-11 items-center text-sm underline decoration-transparent underline-offset-4 transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
