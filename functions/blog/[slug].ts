import { getParam } from '../../src/cms/http';
import { getPublishedPostBySlug } from '../../src/cms/posts';
import type { Env, PostRecord } from '../../src/cms/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, params, request }) => {
  const slug = getParam(params, 'slug');
  const post = await getPublishedPostBySlug(env, slug);
  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  return htmlResponse(renderPost(post, new URL(request.url).origin));
};

function renderPost(post: PostRecord, origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)} | Agent 4 All</title>
  <meta name="description" content="${escapeAttribute(post.excerpt)}">
  <link rel="canonical" href="${escapeAttribute(origin)}/blog/${escapeAttribute(post.slug)}">
  <style>${postCss()}</style>
</head>
<body>
  <main class="shell">
    <header class="masthead">
      <a href="/blog">Blog</a>
      <a href="/admin">CMS</a>
    </header>
    <article>
      <time>${formatDate(post.published_at)}</time>
      <h1>${escapeHtml(post.title)}</h1>
      <p class="excerpt">${escapeHtml(post.excerpt)}</p>
      ${post.cover_image_key ? `<img class="cover" src="/media/${escapeAttribute(post.cover_image_key)}" alt="">` : ''}
      <div class="content">${post.content_html}</div>
    </article>
  </main>
</body>
</html>`;
}

function htmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  });
}

function postCss(): string {
  return `
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1a1f29; background: #fbfcfe; }
    body { margin: 0; }
    a { color: inherit; }
    .shell { width: min(100% - 32px, 820px); margin: 0 auto; padding: 28px 0 80px; }
    .masthead { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 0 34px; }
    .masthead a { text-decoration: none; font-weight: 700; }
    time { color: #667085; font-size: 0.9rem; }
    h1 { font-size: clamp(2.25rem, 8vw, 4.8rem); line-height: 1; margin: 10px 0 16px; }
    .excerpt { color: #485365; font-size: 1.1rem; line-height: 1.7; margin: 0 0 24px; }
    .cover { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; margin: 12px 0 30px; background: #eef2f7; }
    .content { font-size: 1.05rem; line-height: 1.78; }
    .content h2, .content h3 { margin-top: 2em; }
    .content pre { overflow: auto; background: #111827; color: #f8fafc; border-radius: 8px; padding: 16px; }
    .content code { background: #edf1f7; border-radius: 4px; padding: 2px 4px; }
    .content pre code { background: transparent; padding: 0; }
    .content img { max-width: 100%; border-radius: 8px; }
  `;
}

function formatDate(value: string | null): string {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char] || char);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
