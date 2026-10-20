"use client";

import { Input } from "@loftlancer/ui/input";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import DashboardSection from "@/components/section-dashboard";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

export default function SupportHelpPage() {
  const [search, setSearch] = useState("");
  const faq = useQuery(
    trpc.support.listFaqPublic.queryOptions({
      search: search.trim() || undefined,
    }),
  );

  const byCategory = new Map<
    string,
    Array<{
      id: string;
      slug: string;
      title: string;
      category: string;
      sortOrder: number;
    }>
  >();
  for (const item of faq.data?.items ?? []) {
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }

  return (
    <DashboardSection
      title="Help center"
      description="Search frequently asked questions or open a ticket if you need more help."
      back={false}
      action={
        <Link
          href={routes.supportNewTicket()}
          className="text-primary text-sm underline"
        >
          Open a ticket
        </Link>
      }
    >
      <div className="space-y-6">
        <Input
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search FAQ"
        />
        {faq.isError ? (
          <p className="text-destructive text-sm">
            Could not load help articles. Try refreshing the page.
          </p>
        ) : null}
        {[...byCategory.entries()].map(([category, items]) => (
          <section key={category} className="space-y-2">
            <h2 className="font-medium text-sm capitalize">{category}</h2>
            <ul className="divide-y rounded-md border">
              {items?.map((item) => (
                <li key={item.id}>
                  <Link
                    href={routes.supportArticle(item.slug)}
                    className="block px-3 py-2 text-sm hover:bg-muted"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {faq.isSuccess && (faq.data?.items.length ?? 0) === 0 ? (
          <p className="text-muted-foreground text-sm">
            No articles found. You can{" "}
            <Link
              href={routes.supportNewTicket()}
              className="text-primary underline"
            >
              open a support ticket
            </Link>{" "}
            if you need help.
          </p>
        ) : null}
      </div>
    </DashboardSection>
  );
}
