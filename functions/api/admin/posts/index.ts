import { jsonError, jsonOk, readJsonBody } from '../../../../src/cms/http';
import { createPost, listAdminPosts } from '../../../../src/cms/posts';
import type { Env, PostInput } from '../../../../src/cms/types';
import type { AdminData } from '../_middleware';

export const onRequestGet: PagesFunction<Env, string, AdminData> = async ({ env, request }) => {
  const url = new URL(request.url);
  const posts = await listAdminPosts(env, {
    status: url.searchParams.get('status') || undefined,
    q: url.searchParams.get('q') || undefined,
  });

  return jsonOk({ posts });
};

export const onRequestPost: PagesFunction<Env, string, AdminData> = async ({ data, env, request }) => {
  try {
    const input = await readJsonBody(request);
    const post = await createPost(env, input as PostInput, data.user.email);
    return jsonOk({ post }, 201);
  } catch (error) {
    return postError(error);
  }
};

function postError(error: unknown): Response {
  const message = error instanceof Error ? error.message : 'Post could not be saved.';
  const code = message.includes('UNIQUE') ? 'slug_exists' : 'invalid_post';
  return jsonError(code, message, code === 'slug_exists' ? 409 : 400);
}
