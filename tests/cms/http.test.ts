import { describe, expect, it } from 'vitest';
import { jsonError, jsonOk } from '../../src/cms/http';

describe('http helpers', () => {
  it('returns the standard success envelope', async () => {
    const response = jsonOk({ id: 1 }, 201);

    expect(response.status).toBe(201);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ ok: true, data: { id: 1 } });
  });

  it('returns the standard error envelope', async () => {
    const response = jsonError('bad_request', 'Invalid input', 400);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: { code: 'bad_request', message: 'Invalid input' },
    });
  });
});
