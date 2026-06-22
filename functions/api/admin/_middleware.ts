import { getRequestSessionToken, getUserForSession } from '../../../src/cms/auth';
import { jsonError } from '../../../src/cms/http';
import type { AuthUser, Env } from '../../../src/cms/types';

export interface AdminData extends Record<string, unknown> {
  user: AuthUser;
}

export const onRequest: PagesFunction<Env, string, Partial<AdminData>> = async (context) => {
  const user = await getUserForSession(context.env, getRequestSessionToken(context.request));

  if (!user) {
    return jsonError('unauthorized', 'Login is required.', 401);
  }

  context.data.user = user;
  return context.next();
};
