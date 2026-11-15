import { HelpArticlePage } from "@modules/help"

export default async function Page({
  params,
}: {
  readonly params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <HelpArticlePage slug={slug} />
}
