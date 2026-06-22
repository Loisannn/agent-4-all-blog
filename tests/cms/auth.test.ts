import { describe, expect, it } from 'vitest';
import {
  buildSessionCookie,
  hashPassword,
  normalizeEmail,
  parseCookie,
  verifyPassword,
} from '../../src/cms/auth';

describe('auth helpers', () => {
  it('normalizes admin email addresses', () => {
    expect(normalizeEmail(' Admin@Example.COM ')).toBe('admin@example.com');
  });

  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('correct horse battery staple', 'fixed-salt');

    expect(hash).toContain('pbkdf2_sha256$');
    await expect(verifyPassword('correct horse battery staple', hash)).resolves.toBe(true);
    await expect(verifyPassword('wrong password', hash)).resolves.toBe(false);
  });

  it('parses cookie headers', () => {
    expect(parseCookie('cms_session=abc123; theme=dark', 'cms_session')).toBe('abc123');
    expect(parseCookie('', 'cms_session')).toBeNull();
  });

  it('builds an http-only session cookie', () => {
    const cookie = buildSessionCookie('token123', '2026-06-29T00:00:00.000Z');

    expect(cookie).toContain('cms_session=token123');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Path=/');
  });
});
