'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/config'

export type BlogPostInput = {
  title: string
  slug: string
  excerpt?: string
  body?: string
  cover_image_url?: string
  tags?: string[]
  is_published: boolean
  performance_id?: string | null
  organization_id?: string | null
  published_at?: string | null
}

export type ActionResult = { success: boolean; error?: string; id?: string }

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80)
    + '-' + Date.now().toString(36)
}

export async function createBlogPost(input: BlogPostInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase가 설정되지 않았습니다.' }
  }

  const slug = input.slug || generateSlug(input.title)

  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        title: input.title,
        slug,
        excerpt: input.excerpt || null,
        body: input.body || null,
        cover_image_url: input.cover_image_url || null,
        tags: input.tags?.length ? input.tags : null,
        is_published: input.is_published,
        performance_id: input.performance_id || null,
        organization_id: input.organization_id || null,
        published_at: input.is_published ? (input.published_at || new Date().toISOString()) : null,
      })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/blog')
    revalidatePath('/admin/blog')
    return { success: true, id: data.id }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function updateBlogPost(id: string, input: BlogPostInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase가 설정되지 않았습니다.' }
  }

  try {
    const supabase = await createServerSupabaseClient()

    // 기존 published_at 조회 (이미 배포된 글은 날짜 유지)
    const { data: existing } = await supabase
      .from('community_posts')
      .select('published_at')
      .eq('id', id)
      .single()

    const publishedAt = input.is_published
      ? (existing?.published_at || new Date().toISOString())
      : null

    const { error } = await supabase
      .from('community_posts')
      .update({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt || null,
        body: input.body || null,
        cover_image_url: input.cover_image_url || null,
        tags: input.tags?.length ? input.tags : null,
        is_published: input.is_published,
        performance_id: input.performance_id || null,
        organization_id: input.organization_id || null,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/blog')
    revalidatePath(`/blog/${input.slug}`)
    revalidatePath('/admin/blog')
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase가 설정되지 않았습니다.' }
  }

  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/blog')
    revalidatePath('/admin/blog')
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
