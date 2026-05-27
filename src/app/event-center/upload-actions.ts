"use server"

import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/config"

const BUCKET = process.env.SUPABASE_PERFORMANCE_BUCKET ?? "performance-assets"
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string }

/**
 * 공연 이미지(포스터/스틸) Supabase Storage 업로드
 * formData.get("file") — 업로드할 이미지 파일
 * formData.get("folder") — "posters" | "stills" (기본값: "posters")
 */
export async function uploadPerformanceImage(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File | null
  const folder = (formData.get("folder") as string | null) ?? "posters"

  if (!file || file.size === 0) {
    return { success: false, error: "파일이 없습니다." }
  }
  if (file.size > MAX_SIZE) {
    return { success: false, error: "파일 크기는 5MB 이하여야 합니다." }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "JPG, PNG, WebP, GIF 형식만 업로드 가능합니다." }
  }

  // Mock / 환경변수 없음 → 플레이스홀더 URL 반환
  if (!isSupabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.info("[Mock] uploadPerformanceImage:", file.name)
    return {
      success: true,
      url: `https://placehold.co/800x1200/7c3aed/ffffff?text=${encodeURIComponent(file.name)}`,
    }
  }

  try {
    const supabase = createAdminSupabaseClient()
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const path = `${folder}/${uniqueId}.${ext}`

    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error("uploadPerformanceImage storage error:", uploadError)
      return { success: false, error: `업로드 실패: ${uploadError.message}` }
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path)

    return { success: true, url: publicUrl }
  } catch (err) {
    console.error("uploadPerformanceImage unexpected error:", err)
    return { success: false, error: "업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }
  }
}

/**
 * 업로드된 Storage 파일 삭제
 * 이미지 교체 시 기존 파일 정리에 사용
 */
export async function deletePerformanceImage(publicUrl: string): Promise<void> {
  if (!isSupabaseConfigured || !process.env.SUPABASE_SERVICE_ROLE_KEY) return

  try {
    const supabase = createAdminSupabaseClient()
    // publicUrl에서 path 추출: .../performance-assets/posters/xxx.jpg → posters/xxx.jpg
    const bucketPrefix = `/${BUCKET}/`
    const idx = publicUrl.indexOf(bucketPrefix)
    if (idx === -1) return
    const path = publicUrl.slice(idx + bucketPrefix.length)
    await supabase.storage.from(BUCKET).remove([path])
  } catch (err) {
    console.error("deletePerformanceImage error:", err)
  }
}
