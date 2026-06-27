import { jsonError, jsonOk } from '../../../src/cms/http';
import {
  deleteMediaAsset,
  findPostsReferencingMedia,
  getMediaAsset,
  listMediaAssets,
  uploadMedia,
} from '../../../src/cms/media';
import type { Env } from '../../../src/cms/types';
import type { AdminData } from './_middleware';

/* ── POST /api/admin/media — Upload ── */

export const onRequestPost: PagesFunction<Env, string, AdminData> = async ({ data, env, request }) => {
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return jsonError('missing_file', 'A file field named "file" is required.', 400);
    }

    const asset = await uploadMedia(env, file, data.user.email);
    return jsonOk({
      asset,
      url: `/media/${asset.key}`,
    }, 201);
  } catch (error) {
    const typed = error as Error & { code?: string; status?: number };
    return jsonError(typed.code || 'upload_failed', typed.message || 'Upload failed.', typed.status || 500);
  }
};

/* ── GET /api/admin/media — List all media assets ── */

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({ env, request }) => {
  const url = new URL(request.url);

  /* Detail: GET /api/admin/media?id=<id> */
  const idParam = url.searchParams.get('id');
  if (idParam) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
      return jsonError('invalid_id', 'A valid media id is required.', 400);
    }

    const asset = await getMediaAsset(env, id);
    if (!asset) {
      return jsonError('not_found', 'Media asset not found.', 404);
    }

    const refs = await findPostsReferencingMedia(env, asset.key);
    return jsonOk({ asset, referencingPosts: refs });
  }

  /* List: GET /api/admin/media */
  const assets = await listMediaAssets(env);
  return jsonOk({ assets });
};

/* ── DELETE /api/admin/media?id=<id> — Delete ── */

export const onRequestDelete: PagesFunction<Env, string, AdminData> = async ({ env, request }) => {
  const url = new URL(request.url);
  const idParam = url.searchParams.get('id');

  if (!idParam) {
    return jsonError('missing_id', 'A media id query parameter is required.', 400);
  }

  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return jsonError('invalid_id', 'A valid media id is required.', 400);
  }

  const asset = await getMediaAsset(env, id);
  if (!asset) {
    return jsonError('not_found', 'Media asset not found.', 404);
  }

  await deleteMediaAsset(env, id);
  return jsonOk({ deleted: true, asset });
};
