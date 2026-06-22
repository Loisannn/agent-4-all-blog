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

  it('builds stable upload keys with safe filenames', () => {
    const key = buildMediaKey('My Cover.PNG', '2026-06-22T00:00:00.000Z', 'abc123');

    expect(key).toBe('uploads/2026/06/abc123-my-cover.png');
  });
});
