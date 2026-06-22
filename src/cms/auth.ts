import type { AuthUser, Env } from './types';

export const sessionCookieName = 'cms_session';
const defaultIterations = 120_000;
const sessionDays = 7;

export interface LoginResult {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

export interface SetupInput {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  setupToken?: unknown;
}

export interface LoginInput {
  email?: unknown;
  password?: unknown;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function hashPassword(password: string, salt = randomToken(18), iterations = defaultIterations): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    cryptoBytes(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: cryptoBytes(salt),
      iterations,
    },
    keyMaterial,
    256,
  );

  return `pbkdf2_sha256$${iterations}$${salt}$${base64UrlEncode(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') {
    return false;
  }

  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations < 1) {
    return false;
  }

  const candidate = await hashPassword(password, parts[2], iterations);
  return timingSafeEqual(candidate, storedHash);
}

export function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join('='));
    }
  }

  return null;
}

export function buildSessionCookie(token: string, expiresAt: string, secure = false): string {
  const attrs = [
    `${sessionCookieName}=${encodeURIComponent(token)}`,
    'Path=/',
    `Expires=${new Date(expiresAt).toUTCString()}`,
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (secure) {
    attrs.push('Secure');
  }

  return attrs.join('; ');
}

export function buildExpiredSessionCookie(secure = false): string {
  const attrs = [
    `${sessionCookieName}=`,
    'Path=/',
    'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    'HttpOnly',
    'SameSite=Lax',
  ];

  if (secure) {
    attrs.push('Secure');
  }

  return attrs.join('; ');
}

export function getRequestSessionToken(request: Request): string | null {
  return parseCookie(request.headers.get('cookie'), sessionCookieName);
}

export async function getAdminCount(env: Env): Promise<number> {
  const result = await env.DB.prepare('SELECT COUNT(*) AS count FROM auth_admins').first<{ count: number }>();
  return result?.count || 0;
}

export async function setupFirstAdmin(env: Env, input: SetupInput): Promise<AuthUser> {
  const adminCount = await getAdminCount(env);
  if (adminCount > 0) {
    throw Object.assign(new Error('Admin user already exists.'), { code: 'setup_closed', status: 409 });
  }

  if (env.AUTH_SETUP_TOKEN && input.setupToken !== env.AUTH_SETUP_TOKEN) {
    throw Object.assign(new Error('Setup token is invalid.'), { code: 'invalid_setup_token', status: 403 });
  }

  const email = normalizeInputEmail(input.email);
  const password = normalizeInputPassword(input.password);
  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : null;
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const result = await env.DB.prepare(`
    INSERT INTO auth_admins (email, password_hash, name, is_active, created_at, updated_at)
    VALUES (?, ?, ?, 1, ?, ?)
  `).bind(email, passwordHash, name, now, now).run();

  return {
    id: Number(result.meta.last_row_id),
    email,
    name,
  };
}

export async function loginAdmin(env: Env, input: LoginInput): Promise<LoginResult | null> {
  const email = normalizeInputEmail(input.email);
  const password = normalizeInputPassword(input.password);
  const admin = await env.DB.prepare(`
    SELECT id, email, name, password_hash
    FROM auth_admins
    WHERE email = ? AND is_active = 1
  `).bind(email).first<AuthUser & { password_hash: string }>();

  if (!admin || !(await verifyPassword(password, admin.password_hash))) {
    return null;
  }

  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionDays * 24 * 60 * 60 * 1000).toISOString();

  await env.DB.prepare(`
    INSERT INTO auth_sessions (token_hash, admin_id, created_at, expires_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(tokenHash, admin.id, now.toISOString(), expiresAt, now.toISOString()).run();

  await env.DB.prepare(`
    UPDATE auth_admins
    SET last_login_at = ?, updated_at = ?
    WHERE id = ?
  `).bind(now.toISOString(), now.toISOString(), admin.id).run();

  return {
    user: { id: admin.id, email: admin.email, name: admin.name },
    token,
    expiresAt,
  };
}

export async function getUserForSession(env: Env, token: string | null): Promise<AuthUser | null> {
  if (!token) {
    return null;
  }

  const tokenHash = await sha256Hex(token);
  const now = new Date().toISOString();
  const user = await env.DB.prepare(`
    SELECT a.id, a.email, a.name
    FROM auth_sessions s
    JOIN auth_admins a ON a.id = s.admin_id
    WHERE s.token_hash = ?
      AND s.expires_at > ?
      AND a.is_active = 1
  `).bind(tokenHash, now).first<AuthUser>();

  if (!user) {
    return null;
  }

  await env.DB.prepare('UPDATE auth_sessions SET last_seen_at = ? WHERE token_hash = ?').bind(now, tokenHash).run();
  return user;
}

export async function deleteSession(env: Env, token: string | null): Promise<void> {
  if (!token) {
    return;
  }

  await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
}

function normalizeInputEmail(value: unknown): string {
  if (typeof value !== 'string') {
    throw Object.assign(new Error('Email is required.'), { code: 'invalid_email', status: 400 });
  }

  const email = normalizeEmail(value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error('A valid email is required.'), { code: 'invalid_email', status: 400 });
  }

  return email;
}

function normalizeInputPassword(value: unknown): string {
  if (typeof value !== 'string' || value.length < 8) {
    throw Object.assign(new Error('Password must be at least 8 characters.'), { code: 'invalid_password', status: 400 });
  }

  return value;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', cryptoBytes(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function randomToken(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

function textBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function cryptoBytes(value: string): ArrayBuffer {
  const bytes = textBytes(value);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function timingSafeEqual(left: string, right: string): boolean {
  const leftBytes = textBytes(left);
  const rightBytes = textBytes(right);
  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index];
  }

  return diff === 0;
}
