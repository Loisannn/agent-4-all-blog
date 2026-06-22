import { buildSessionCookie, loginAdmin } from '../../../src/cms/auth';
import { jsonError, jsonOk, readJsonBody } from '../../../src/cms/http';
import type { Env } from '../../../src/cms/types';

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const body = await readJsonBody(request);
    const login = await loginAdmin(env, body as Record<string, unknown>);

    if (!login) {
      return jsonError('invalid_credentials', 'Email or password is incorrect.', 401);
    }

    const response = jsonOk({ user: login.user });
    response.headers.append('set-cookie', buildSessionCookie(login.token, login.expiresAt, new URL(request.url).protocol === 'https:'));
    return response;
  } catch (error) {
    const typed = error as Error & { code?: string; status?: number };
    return jsonError(typed.code || 'login_failed', typed.message || 'Login failed.', typed.status || 400);
  }
};
