"use client"

import Markdown from "react-markdown"

export function HelpArticleBody({ body }: { readonly body: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
      <Markdown
        components={{
          a: ({ href, children }) => (
            <a
              className="font-medium underline"
              href={href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {children}
            </a>
          ),
        }}
      >
        {body}
      </Markdown>
    </div>
  )
}
