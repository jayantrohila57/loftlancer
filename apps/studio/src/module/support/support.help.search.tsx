"use client";

import { EmptyState } from "@features/patterns/core/client/patterns.empty-state";
import { VersionBadge } from "@features/patterns/core/client/patterns.version-badge";
import {
  docsSiteUrl,
  docsUrl,
} from "@features/shell/utils/shell.platform-urls.utils";
import { Input } from "@loftlancer/ui/input";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { appIcons } from "@/lib/icons";
import { SupportTicketCreateAction } from "@/module/support/support.ticket.create-action";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import type { SupportArticles } from "./support.article.service";

export function SupportHelpSearch({
  initialArticles,
}: {
  initialArticles: SupportArticles;
}) {
  const [search, setSearch] = useState("");
  const faq = useQuery({
    ...trpc.support.listFaqPublic.queryOptions({
      search: search.trim() || undefined,
    }),
    initialData: search.trim() ? undefined : initialArticles,
  });

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
          <h2 className="text-sm font-medium capitalize">{category}</h2>
          <ul className="divide-y rounded-md border">
            {items?.map((item) => (
              <li key={item.id}>
                <Link
                  href={routes.supportArticle(item.slug)}
                  className="hover:bg-muted block px-3 py-2 text-sm"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {faq.isSuccess && (faq.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          icon={appIcons.searchEmpty}
          title={
            search.trim()
              ? "No articles match your search"
              : "No help articles yet"
          }
          description={
            search.trim()
              ? "Try a different search, or contact support for help."
              : "Browse the Loftlancer documentation or contact support for help."
          }
          actionLabel={search.trim() ? "Clear search" : "View documentation"}
          actionHref={search.trim() ? undefined : docsUrl()}
          onAction={search.trim() ? () => setSearch("") : undefined}
          secondaryAction={
            search.trim() ? (
              <SupportTicketCreateAction>
                Open a ticket
              </SupportTicketCreateAction>
            ) : undefined
          }
        />
      ) : null}
      <div className="flex justify-end border-t pt-3">
        <VersionBadge href={`${docsSiteUrl()}/changelog`} />
      </div>
    </div>
  );
}
