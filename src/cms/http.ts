export function jsonOk<T>(data: T, status = 200): Response {
  return Response.json(
    { ok: true, data },
    {
      status,
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}

export function jsonError(code: string, message: string, status = 400): Response {
  return Response.json(
    {
      ok: false,
      error: { code, message },
    },
    {
      status,
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Expected application/json request body.');
  }

  return request.json();
}

export function getParam(params: Record<string, string | string[]>, name: string): string {
  const value = params[name];
  if (Array.isArray(value)) {
    return value.join('/');
  }

  return value || '';
}
