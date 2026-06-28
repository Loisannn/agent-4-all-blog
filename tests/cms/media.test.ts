import { describe, expect, it } from 'vitest';
import { buildMediaKey, validateImageFile } from '../../src/cms/media';

describe('media helpers', () => {
  it('accepts supported image files', () => {
    const file = new File(['image'], 'My Cover.PNG', { type: 'image/png' });

    expect(validateImageFile(file)).toEqual({ ok: true });
  });

  it('rejects unsupported files', () => {
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' });

    expect(validateImageFile(file)).toEqual({
      ok: false,
      code: 'invalid_file_type',
      message: 'Only JPEG, PNG, WebP, and GIF images are allowed.',
    });
  });

  it('rejects files larger than 5MB', () => {
    const buffer = new Uint8Array(6 * 1024 * 1024);
    const file = new File([buffer], 'huge.jpg', { type: 'image/jpeg' });

    expect(validateImageFile(file)).toEqual({
      ok: false,
      code: 'file_too_large',
      message: 'Images must be 5MB or smaller.',
    });
  });

  it('builds stable upload keys with safe filenames', () => {
    const key = buildMediaKey('My Cover.PNG', '2026-06-22T00:00:00.000Z', 'abc123');

    expect(key).toBe('uploads/2026/06/abc123-my-cover.png');
  });

  it('builds upload keys with current date when no timestamp provided', () => {
    const key = buildMediaKey('photo.jpg', undefined as unknown as string, 'id001');

    expect(key).toMatch(/^uploads\/\d{4}\/\d{2}\/id001-photo\.jpg$/);
  });

  it('handles filenames with special characters', () => {
    const key = buildMediaKey('Hello World!!! 图片.jpg', '2026-06-22T00:00:00.000Z', 'xyz');

    // Non-ASCII chars stripped, multiple special chars collapsed to single hyphen
    expect(key).toMatch(/^uploads\/2026\/06\/xyz-hello-world(-\w+)?\.jpg$/);
  });

  it('handles filenames without extensions', () => {
    const key = buildMediaKey('README', '2026-06-22T00:00:00.000Z', 'doc');

    expect(key).toBe('uploads/2026/06/doc-readme');
  });

  it('accepts all supported mime types', () => {
    for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
      const file = new File(['data'], 'test', { type: mime });
      expect(validateImageFile(file)).toEqual({ ok: true });
    }
  });
});
