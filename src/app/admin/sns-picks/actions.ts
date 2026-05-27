'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/config'

export type SnsPickInput = {
  performance_id: string
  caption?: string
  channel: 'instagram' | 'youtube' | 'tiktok' | 'all'
  display_order?: number
  promo_start?: string
  promo_end?: string
  is_active?: boolean
}

export type ActionResult = { success: boolean; error?: string }

export async function createSnsPick(input: SnsPickInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase가 설정되지 않았습니다.' }

  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('sns_picks').insert({
      performance_id: input.performance_id,
      caption: input.caption || null,
      channel: input.channel,
      display_order: input.display_order ?? 0,
      promo_start: input.promo_start || null,
      promo_end: input.promo_end || null,
      is_active: input.is_active ?? true,
    })

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/sns-picks')
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function updateSnsPick(id: string, input: Partial<SnsPickInput>): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase가 설정되지 않았습니다.' }

  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('sns_picks')
      .update({
        ...(input.caption !== undefined && { caption: input.caption || null }),
        ...(input.channel !== undefined && { channel: input.channel }),
        ...(input.display_order !== undefined && { display_order: input.display_order }),
        ...(input.promo_start !== undefined && { promo_start: input.promo_start || null }),
        ...(input.promo_end !== undefined && { promo_end: input.promo_end || null }),
        ...(input.is_active !== undefined && { is_active: input.is_active }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/sns-picks')
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function deleteSnsPick(id: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase가 설정되지 않았습니다.' }

  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.from('sns_picks').delete().eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    revalidatePath('/admin/sns-picks')
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function reorderSnsPick(id: string, newOrder: number): Promise<ActionResult> {
  return updateSnsPick(id, { display_order: newOrder })
}
