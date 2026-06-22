import { getAdminCount, getRequestSessionToken, getUserForSession } from '../../../src/cms/auth';
import { jsonOk } from '../../../src/cms/http';
import type { Env } from '../../../src/cms/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const [adminCount, user] = await Promise.all([
    getAdminCount(env),
    getUserForSession(env, getRequestSessionToken(request)),
  ]);

  return jsonOk({
    authenticated: Boolean(user),
    setupRequired: adminCount === 0,
    user,
  });
};
