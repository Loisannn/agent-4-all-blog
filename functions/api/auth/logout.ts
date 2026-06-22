import { buildExpiredSessionCookie, deleteSession, getRequestSessionToken } from '../../../src/cms/auth';
import { jsonOk } from '../../../src/cms/http';
import type { Env } from '../../../src/cms/types';

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  await deleteSession(env, getRequestSessionToken(request));

  const response = jsonOk({ loggedOut: true });
  response.headers.append('set-cookie', buildExpiredSessionCookie(new URL(request.url).protocol === 'https:'));
  return response;
};
