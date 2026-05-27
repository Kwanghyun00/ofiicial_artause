import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BlogPostForm } from "@/components/admin/BlogPostForm"
import { createBlogPost } from "../actions"

export const metadata = {
  title: "새 글 작성 — Admin",
}

export default function AdminBlogNewPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          블로그 목록
        </Link>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-xl font-bold text-foreground">새 글 작성</h1>
      </div>

      <BlogPostForm mode="create" action={createBlogPost} />
    </div>
  )
}
