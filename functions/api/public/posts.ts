import { jsonOk } from '../../../src/cms/http';
import { listPublishedPosts } from '../../../src/cms/posts';
import type { Env } from '../../../src/cms/types';

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const posts = await listPublishedPosts(env);
  return jsonOk({ posts });
};
