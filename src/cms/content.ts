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
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug || 'untitled';
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
