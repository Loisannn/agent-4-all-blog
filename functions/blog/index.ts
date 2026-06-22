import { listPublishedPosts } from '../../src/cms/posts';
import type { Env, PostRecord } from '../../src/cms/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const posts = await listPublishedPosts(env);
  const origin = new URL(request.url).origin;

  return htmlResponse(renderBlogIndex(posts, origin));
};

function renderBlogIndex(posts: PostRecord[], origin: string): string {
  const items = posts.map((post) => `
    <article class="post">
      ${post.cover_image_key ? `<img src="/media/${escapeAttribute(post.cover_image_key)}" alt="">` : ''}
      <div>
        <time>${formatDate(post.published_at)}</time>
        <h2><a href="/blog/${escapeAttribute(post.slug)}">${escapeHtml(post.title)}</a></h2>
        <p>${escapeHtml(post.excerpt)}</p>
      </div>
    </article>
  `).join('');

  return pageShell('Blog', origin, `
    <main class="shell">
      <header class="masthead">
        <a href="/" class="brand">Agent 4 All</a>
        <a href="/admin" class="admin-link">CMS</a>
      </header>
      <section class="intro">
        <p class="eyebrow">Latest posts</p>
        <h1>Blog</h1>
      </section>
      <section class="list">${items || '<p class="empty">No published posts yet.</p>'}</section>
    </main>
  `);
}

function htmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  });
}

function pageShell(title: string, origin: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | Agent 4 All</title>
  <link rel="canonical" href="${escapeAttribute(origin)}/blog">
  <style>${blogCss()}</style>
</head>
<body>${body}</body>
</html>`;
}

function blogCss(): string {
  return `
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1a1f29; background: #f7f8fb; }
    body { margin: 0; }
    a { color: inherit; }
    .shell { width: min(100% - 32px, 960px); margin: 0 auto; padding: 28px 0 72px; }
    .masthead { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 0 28px; }
    .brand { font-weight: 800; text-decoration: none; }
    .admin-link { border: 1px solid #cfd6e4; border-radius: 6px; padding: 8px 12px; text-decoration: none; background: white; }
    .intro { border-bottom: 1px solid #d8deea; padding-bottom: 24px; }
    .eyebrow, time { color: #667085; font-size: 0.86rem; letter-spacing: 0; }
    h1 { font-size: clamp(2rem, 7vw, 4rem); line-height: 1; margin: 8px 0 0; }
    .list { display: grid; gap: 16px; margin-top: 24px; }
    .post { display: grid; grid-template-columns: minmax(0, 220px) 1fr; gap: 18px; background: white; border: 1px solid #e1e6ef; border-radius: 8px; padding: 14px; }
    .post img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 6px; background: #eef2f7; }
    .post h2 { font-size: 1.45rem; margin: 6px 0; }
    .post h2 a { text-decoration: none; }
    .post p { color: #485365; margin: 0; line-height: 1.6; }
    .empty { color: #667085; }
    @media (max-width: 680px) { .post { grid-template-columns: 1fr; } }
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
