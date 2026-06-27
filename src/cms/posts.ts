import { createExcerpt, renderMarkdown, slugify } from './content';
import type { Env, PostInput, PostRecord, PostStatus, PreparedPostPayload } from './types';

type ExistingPost = Pick<PostRecord, 'published_at'>;

const postSelect = `
  id,
  slug,
  title,
  excerpt,
  content_markdown,
  content_html,
  cover_image_key,
  category,
  author_name,
  status,
  published_at,
  created_at,
  updated_at,
  created_by,
  updated_by
`;

export function preparePostPayload(input: PostInput, existing?: Partial<ExistingPost>, now = new Date().toISOString()): PreparedPostPayload {
  const title = asTrimmedString(input.title);
  const contentMarkdown = asString(input.content_markdown);
  const status = normalizeStatus(input.status);

  if (!title) {
    throw new Error('Title is required.');
  }

  if (!contentMarkdown.trim()) {
    throw new Error('Content is required.');
  }

  return {
    title,
    slug: slugify(asTrimmedString(input.slug) || title),
    excerpt: createExcerpt(contentMarkdown, input.excerpt),
    content_markdown: contentMarkdown,
    content_html: renderMarkdown(contentMarkdown),
    cover_image_key: nullableTrimmedString(input.cover_image_key),
    category: asTrimmedString(input.category),
    author_name: asTrimmedString(input.author_name),
    status,
    published_at: status === 'published' ? existing?.published_at || now : null,
  };
}

export async function listAdminPosts(env: Env, filters: { status?: string; q?: string } = {}): Promise<PostRecord[]> {
  const where: string[] = [];
  const binds: unknown[] = [];

  if (filters.status === 'draft' || filters.status === 'published') {
    where.push('status = ?');
    binds.push(filters.status);
  }

  if (filters.q?.trim()) {
    where.push('(title LIKE ? OR slug LIKE ?)');
    const q = `%${filters.q.trim()}%`;
    binds.push(q, q);
  }

  const sql = `
    SELECT ${postSelect}
    FROM posts
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY updated_at DESC
    LIMIT 100
  `;

  const result = await env.DB.prepare(sql).bind(...binds).all<PostRecord>();
  return result.results || [];
}

export async function listPublishedPosts(env: Env): Promise<PostRecord[]> {
  const result = await env.DB.prepare(`
    SELECT ${postSelect}
    FROM posts
    WHERE status = 'published'
      AND published_at IS NOT NULL
      AND published_at <= ?
    ORDER BY published_at DESC
    LIMIT 50
  `).bind(new Date().toISOString()).all<PostRecord>();

  return result.results || [];
}

export async function getPostById(env: Env, id: number): Promise<PostRecord | null> {
  return env.DB.prepare(`SELECT ${postSelect} FROM posts WHERE id = ?`).bind(id).first<PostRecord>();
}

export async function getPublishedPostBySlug(env: Env, slug: string): Promise<PostRecord | null> {
  return env.DB.prepare(`
    SELECT ${postSelect}
    FROM posts
    WHERE slug = ?
      AND status = 'published'
      AND published_at IS NOT NULL
      AND published_at <= ?
  `).bind(slug, new Date().toISOString()).first<PostRecord>();
}

export async function createPost(env: Env, input: PostInput, userEmail: string): Promise<PostRecord> {
  const payload = preparePostPayload(input);
  const now = new Date().toISOString();
  const result = await env.DB.prepare(`
    INSERT INTO posts (
      slug,
      title,
      excerpt,
      content_markdown,
      content_html,
      cover_image_key,
      category,
      author_name,
      status,
      published_at,
      created_at,
      updated_at,
      created_by,
      updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    payload.slug,
    payload.title,
    payload.excerpt,
    payload.content_markdown,
    payload.content_html,
    payload.cover_image_key,
    payload.category,
    payload.author_name,
    payload.status,
    payload.published_at,
    now,
    now,
    userEmail,
    userEmail,
  ).run();

  await recordAuditEvent(env, 'post.created', 'post', Number(result.meta.last_row_id), userEmail);
  const created = await getPostById(env, Number(result.meta.last_row_id));
  if (!created) {
    throw new Error('Created post could not be loaded.');
  }

  return created;
}

export async function updatePost(env: Env, id: number, input: PostInput, userEmail: string): Promise<PostRecord | null> {
  const existing = await getPostById(env, id);
  if (!existing) {
    return null;
  }

  const payload = preparePostPayload(
    {
      title: input.title ?? existing.title,
      slug: input.slug ?? existing.slug,
      excerpt: input.excerpt ?? existing.excerpt,
      content_markdown: input.content_markdown ?? existing.content_markdown,
      cover_image_key: input.cover_image_key ?? existing.cover_image_key,
      category: input.category ?? existing.category,
      author_name: input.author_name ?? existing.author_name,
      status: input.status ?? existing.status,
    },
    existing,
  );

  await env.DB.prepare(`
    UPDATE posts
    SET slug = ?,
        title = ?,
        excerpt = ?,
        content_markdown = ?,
        content_html = ?,
        cover_image_key = ?,
        category = ?,
        author_name = ?,
        status = ?,
        published_at = ?,
        updated_at = ?,
        updated_by = ?
    WHERE id = ?
  `).bind(
    payload.slug,
    payload.title,
    payload.excerpt,
    payload.content_markdown,
    payload.content_html,
    payload.cover_image_key,
    payload.category,
    payload.author_name,
    payload.status,
    payload.published_at,
    new Date().toISOString(),
    userEmail,
    id,
  ).run();

  await recordAuditEvent(env, 'post.updated', 'post', id, userEmail);
  return getPostById(env, id);
}

export async function deletePost(env: Env, id: number, userEmail: string): Promise<boolean> {
  const existing = await getPostById(env, id);
  if (!existing) {
    return false;
  }

  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
  await recordAuditEvent(env, 'post.deleted', 'post', id, userEmail);
  return true;
}

export async function recordAuditEvent(env: Env, action: string, entityType: string, entityId: number | null, userEmail: string): Promise<void> {
  await env.DB.prepare(`
    INSERT INTO audit_events (action, entity_type, entity_id, actor_email, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(action, entityType, entityId, userEmail, new Date().toISOString()).run();
}

function normalizeStatus(value: unknown): PostStatus {
  return value === 'published' ? 'published' : 'draft';
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nullableTrimmedString(value: unknown): string | null {
  const trimmed = asTrimmedString(value);
  return trimmed || null;
}
