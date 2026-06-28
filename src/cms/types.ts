export type PostStatus = 'draft' | 'published';

export interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  AUTH_SETUP_TOKEN?: string;
}

export interface AccessUser {
  email: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
}

export interface PostRecord {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content_markdown: string;
  content_html: string;
  cover_image_key: string | null;
  category: string;
  author_name: string;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface MediaAssetRecord {
  id: number;
  key: string;
  filename: string;
  mime_type: string;
  size: number;
  uploaded_at: string;
  uploaded_by: string | null;
}

export interface PostInput {
  title?: unknown;
  slug?: unknown;
  excerpt?: unknown;
  content_markdown?: unknown;
  cover_image_key?: unknown;
  category?: unknown;
  author_name?: unknown;
  status?: unknown;
}

export interface PreparedPostPayload {
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  content_html: string;
  cover_image_key: string | null;
  category: string;
  author_name: string;
  status: PostStatus;
  published_at: string | null;
}
