import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const markdown = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
});

const htmlTagPattern = /<[^>]*>/g;
const markdownSyntaxPattern = /[#>*_`~\[\]()!-]+/g;

export function slugify(value: string): string {
  const slug = value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  if (!slug) {
    return `post-${hash36(value)}`;
  }

  return slug;
}

function hash36(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}

export function renderMarkdown(value: string): string {
  const rendered = markdown.render(stripUnsafeSchemes(value || ''));

  return sanitizeHtml(rendered, {
    allowedTags: [
      'a',
      'blockquote',
      'br',
      'code',
      'em',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'hr',
      'img',
      'li',
      'ol',
      'p',
      'pre',
      'strong',
      'ul',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: 'img',
        attribs: {
          ...attribs,
          loading: 'lazy',
        },
      }),
    },
  });
}

function stripUnsafeSchemes(value: string): string {
  return value.replace(/\b(?:javascript|vbscript|data):/gi, '');
}

export function createExcerpt(markdownSource: string, explicitExcerpt: unknown, maxLength = 180): string {
  if (typeof explicitExcerpt === 'string' && explicitExcerpt.trim()) {
    return truncate(explicitExcerpt.trim(), maxLength);
  }

  const text = renderMarkdown(markdownSource)
    .replace(htmlTagPattern, ' ')
    .replace(markdownSyntaxPattern, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return truncate(text, maxLength);
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}…`;
}
