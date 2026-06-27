import type { Env, MediaAssetRecord, PostRecord } from './types';

export const maxUploadBytes = 5 * 1024 * 1024;

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export type UploadValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

export function validateImageFile(file: File): UploadValidationResult {
  if (!allowedImageTypes.has(file.type)) {
    return {
      ok: false,
      code: 'invalid_file_type',
      message: 'Only JPEG, PNG, WebP, and GIF images are allowed.',
    };
  }

  if (file.size > maxUploadBytes) {
    return {
      ok: false,
      code: 'file_too_large',
      message: 'Images must be 5MB or smaller.',
    };
  }

  return { ok: true };
}

export function buildMediaKey(filename: string, now = new Date().toISOString(), id: string = crypto.randomUUID()): string {
  const date = new Date(now);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `uploads/${year}/${month}/${id}-${safeFilename(filename)}`;
}

export async function uploadMedia(env: Env, file: File, userEmail: string): Promise<MediaAssetRecord> {
  const validation = validateImageFile(file);
  if (!validation.ok) {
    throw Object.assign(new Error(validation.message), { code: validation.code, status: 400 });
  }

  const key = buildMediaKey(file.name);
  await env.MEDIA_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  const now = new Date().toISOString();
  const result = await env.DB.prepare(`
    INSERT INTO media_assets (key, filename, mime_type, size, uploaded_at, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(key, file.name, file.type, file.size, now, userEmail).run();

  const asset = await env.DB.prepare(`
    SELECT id, key, filename, mime_type, size, uploaded_at, uploaded_by
    FROM media_assets
    WHERE id = ?
  `).bind(Number(result.meta.last_row_id)).first<MediaAssetRecord>();

  if (!asset) {
    throw new Error('Uploaded media could not be loaded.');
  }

  return asset;
}

function safeFilename(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  const rawBase = dotIndex >= 0 ? filename.slice(0, dotIndex) : filename;
  const rawExtension = dotIndex >= 0 ? filename.slice(dotIndex + 1) : '';
  const base = rawBase
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'file';
  const extension = rawExtension
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

  return extension ? `${base}.${extension}` : base;
}

/* ── Media Management ── */

export async function listMediaAssets(env: Env): Promise<MediaAssetRecord[]> {
  const result = await env.DB.prepare(`
    SELECT id, key, filename, mime_type, size, uploaded_at, uploaded_by
    FROM media_assets
    ORDER BY uploaded_at DESC
    LIMIT 200
  `).all<MediaAssetRecord>();

  return result.results || [];
}

export async function getMediaAsset(env: Env, id: number): Promise<MediaAssetRecord | null> {
  return env.DB.prepare(`
    SELECT id, key, filename, mime_type, size, uploaded_at, uploaded_by
    FROM media_assets
    WHERE id = ?
  `).bind(id).first<MediaAssetRecord>();
}

export interface MediaRefPost {
  id: number;
  title: string;
  slug: string;
  status: string;
}

export async function findPostsReferencingMedia(env: Env, mediaKey: string): Promise<MediaRefPost[]> {
  const result = await env.DB.prepare(`
    SELECT id, title, slug, status
    FROM posts
    WHERE cover_image_key = ?
       OR content_markdown LIKE ?
       OR content_html LIKE ?
    ORDER BY updated_at DESC
  `).bind(mediaKey, `%${mediaKey}%`, `%${mediaKey}%`).all<MediaRefPost>();

  return result.results || [];
}

export async function deleteMediaAsset(env: Env, id: number): Promise<MediaAssetRecord | null> {
  const asset = await getMediaAsset(env, id);
  if (!asset) {
    return null;
  }

  await env.MEDIA_BUCKET.delete(asset.key);
  await env.DB.prepare('DELETE FROM media_assets WHERE id = ?').bind(id).run();

  return asset;
}
