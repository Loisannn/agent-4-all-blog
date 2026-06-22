import { getParam, jsonError, jsonOk, readJsonBody } from '../../../../src/cms/http';
import { deletePost, getPostById, updatePost } from '../../../../src/cms/posts';
import type { Env, PostInput } from '../../../../src/cms/types';
import type { AdminData } from '../_middleware';

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({ env, params }) => {
  const id = parseId(params);
  if (!id) {
    return jsonError('invalid_id', 'A valid post id is required.', 400);
  }

  const post = await getPostById(env, id);
  if (!post) {
    return jsonError('not_found', 'Post not found.', 404);
  }

  return jsonOk({ post });
};

export const onRequestPatch: PagesFunction<Env, string, AdminData> = async ({ data, env, params, request }) => {
  const id = parseId(params);
  if (!id) {
    return jsonError('invalid_id', 'A valid post id is required.', 400);
  }

  try {
    const input = await readJsonBody(request);
    const post = await updatePost(env, id, input as PostInput, data.user.email);
    if (!post) {
      return jsonError('not_found', 'Post not found.', 404);
    }

    return jsonOk({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Post could not be saved.';
    const code = message.includes('UNIQUE') ? 'slug_exists' : 'invalid_post';
    return jsonError(code, message, code === 'slug_exists' ? 409 : 400);
  }
};

export const onRequestDelete: PagesFunction<Env, string, AdminData> = async ({ data, env, params }) => {
  const id = parseId(params);
  if (!id) {
    return jsonError('invalid_id', 'A valid post id is required.', 400);
  }

  const deleted = await deletePost(env, id, data.user.email);
  if (!deleted) {
    return jsonError('not_found', 'Post not found.', 404);
  }

  return jsonOk({ deleted: true });
};

function parseId(params: Record<string, string | string[]>): number | null {
  const id = Number(getParam(params, 'id'));
  return Number.isInteger(id) && id > 0 ? id : null;
}
