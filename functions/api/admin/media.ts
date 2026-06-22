import { jsonError, jsonOk } from '../../../src/cms/http';
import { uploadMedia } from '../../../src/cms/media';
import type { Env } from '../../../src/cms/types';
import type { AdminData } from './_middleware';

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
