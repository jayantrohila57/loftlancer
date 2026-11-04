import type { ReactNode } from "react";

export type SharedFooterGroup = {
  label: string;
  links: readonly { href: string; label: string }[];
};

/** Reusable site footer; callers supply the brand and route groups. */
export function SharedFooter({
  brand,
  description,
  groups,
  note,
  trailing,
  className,
}: {
  brand: ReactNode;
  description?: string;
  groups: readonly SharedFooterGroup[];
  note?: string;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <footer
      className={`bg-neutral-950 text-neutral-50 dark:bg-neutral-900 dark:text-neutral-100 ${className ?? ""}`}
    >
      <div className="mx-auto w-full max-w-[76rem] px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="border-background/15 grid gap-10 border-b pb-10 md:grid-cols-[1.25fr_1fr] md:gap-14 md:pb-14">
          <div className="max-w-lg">
            {brand}
            {description ? (
              <p className="mt-5 max-w-md text-sm leading-6 text-neutral-50/75 dark:text-neutral-100/75">
                {description}
              </p>
            ) : null}
            {note ? (
              <p className="mt-5 text-xs text-neutral-50/65 dark:text-neutral-100/65">
                {note}
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4 md:gap-x-6">
            {groups.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h2 className="text-xs font-medium text-neutral-50/75 dark:text-neutral-100/75">
                  {group.label}
                </h2>
                <ul className="mt-3 grid gap-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="focus-visible:ring-ring inline-flex min-h-11 items-center rounded-sm text-sm text-neutral-50/75 transition-colors outline-none hover:text-neutral-50 focus-visible:ring-2 dark:text-neutral-100/75 dark:hover:text-neutral-100"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        {trailing ? <div className="pt-5">{trailing}</div> : null}
      </div>
    </footer>
  );
}
