import { buildSessionCookie, loginAdmin, setupFirstAdmin } from '../../../src/cms/auth';
import { jsonError, jsonOk, readJsonBody } from '../../../src/cms/http';
import type { Env, AuthUser } from '../../../src/cms/types';

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  try {
    const body = await readJsonBody(request);
    const user = await setupFirstAdmin(env, body as Record<string, unknown>);
    const login = await loginAdmin(env, {
      email: user.email,
      password: (body as { password?: unknown }).password,
    });

    if (!login) {
      return jsonError('login_failed', 'Admin was created but login failed.', 500);
    }

    return withSession(jsonOk({ user: sanitizeUser(user) }, 201), login.token, login.expiresAt, request);
  } catch (error) {
    return authError(error);
  }
};

function withSession(response: Response, token: string, expiresAt: string, request: Request): Response {
  response.headers.append('set-cookie', buildSessionCookie(token, expiresAt, new URL(request.url).protocol === 'https:'));
  return response;
}

function sanitizeUser(user: AuthUser): AuthUser {
  return { id: user.id, email: user.email, name: user.name };
}

function authError(error: unknown): Response {
  const typed = error as Error & { code?: string; status?: number };
  return jsonError(typed.code || 'auth_failed', typed.message || 'Authentication failed.', typed.status || 400);
}
