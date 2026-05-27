"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type Props = {
  body: string
}

export function BlogPostBody({ body }: Props) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert
      prose-headings:font-bold prose-headings:text-foreground
      prose-p:text-foreground/80 prose-p:leading-relaxed
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-strong:text-foreground
      prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
      prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-foreground
      prose-pre:bg-muted prose-pre:border prose-pre:border-border
      prose-hr:border-border
      prose-img:rounded-xl
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  )
}
