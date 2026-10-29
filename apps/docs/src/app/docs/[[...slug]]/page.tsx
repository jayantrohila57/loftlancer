import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { source } from "@/lib/source";
import { DocumentationPageView } from "@/module/documentation/documentation.page.view";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function Page(props: PageProps) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return <DocumentationPageView page={page} />;
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const title = page.data.title;
  const description =
    page.data.description ?? `${title} in the Loftlancer documentation.`;
  // Docs pages read "Title | Loftlancer Docs"; the index keeps the plain name.
  const fullTitle =
    page.url === "/docs" ? "Loftlancer Docs" : `${title} | Loftlancer Docs`;
  return pageMetadata({
    title: fullTitle,
    description,
    path: page.url,
    absoluteTitle: true,
  });
}
