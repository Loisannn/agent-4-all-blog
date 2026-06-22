import { getParam, jsonError } from '../../src/cms/http';
import type { Env } from '../../src/cms/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const key = getParam(params, 'key').replace(/^\/+/, '');
  if (!key) {
    return jsonError('not_found', 'Media not found.', 404);
  }

  const object = await env.MEDIA_BUCKET.get(key);
  if (!object) {
    return jsonError('not_found', 'Media not found.', 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');

  return new Response(object.body, { headers });
};
