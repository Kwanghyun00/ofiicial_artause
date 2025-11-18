/**
 * Supabase Storage utilities
 *
 * Handles file uploads to Supabase Storage buckets
 * - Image uploads for event posters and stills
 * - Automatic file naming with timestamps
 * - URL generation for stored files
 */

import { createSupabaseClient } from './client';
import { isSupabaseConfigured } from '../config';

const BUCKET_NAME = 'event-images';

/**
 * Upload a single file to Supabase Storage
 *
 * @param file - File to upload
 * @param folder - Optional folder path within bucket (e.g., 'posters', 'stills')
 * @returns Public URL of uploaded file, or null if upload fails
 */
export async function uploadFile(
  file: File,
  folder?: string
): Promise<string | null> {
  if (!isSupabaseConfigured) {
    console.log('[Mock] Would upload file:', file.name);
    return `/mock-uploads/${folder ?? 'default'}/${file.name}`;
  }

  try {
    const supabase = createSupabaseClient();

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;
    const path = folder ? `${folder}/${filename}` : filename;

    // Upload file to bucket
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('File upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return null;
  }
}

/**
 * Upload multiple files to Supabase Storage
 *
 * @param files - Array of files to upload
 * @param folder - Optional folder path within bucket
 * @returns Array of public URLs for uploaded files
 */
export async function uploadFiles(
  files: File[],
  folder?: string
): Promise<string[]> {
  const uploadPromises = files.map(file => uploadFile(file, folder));
  const results = await Promise.all(uploadPromises);

  // Filter out null results (failed uploads)
  return results.filter((url): url is string => url !== null);
}

/**
 * Delete a file from Supabase Storage
 *
 * @param path - Full path to file in bucket
 * @returns True if deletion was successful
 */
export async function deleteFile(path: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.log('[Mock] Would delete file:', path);
    return true;
  }

  try {
    const supabase = createSupabaseClient();

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('File deletion error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected deletion error:', error);
    return false;
  }
}

/**
 * Extract the storage path from a public URL
 *
 * @param url - Public URL from Supabase Storage
 * @returns Storage path, or null if URL is invalid
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf(BUCKET_NAME);

    if (bucketIndex === -1) return null;

    return pathParts.slice(bucketIndex + 1).join('/');
  } catch {
    return null;
  }
}
