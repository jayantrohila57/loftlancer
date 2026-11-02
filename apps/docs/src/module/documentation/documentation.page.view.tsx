import { createRelativeLink } from "fumadocs-ui/mdx";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import { getMDXComponents } from "@/components/mdx";
import { source } from "@/lib/source";

type DocumentationPage = NonNullable<ReturnType<typeof source.getPage>>;

export function DocumentationPageView({ page }: { page: DocumentationPage }) {
  const MDX = page.data.body;
  const components = getMDXComponents({ a: createRelativeLink(source, page) });
  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={components} />
      </DocsBody>
    </DocsPage>
  );
}
