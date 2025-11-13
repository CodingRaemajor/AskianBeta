import sanitizeHtmlLib, { Attributes, Transformer } from 'sanitize-html';

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export function sanitizeUrl(u: string) {
  try {
    const url = new URL(u);
    if (!url.hostname.endsWith('uregina.ca')) return 'https://www.uregina.ca/';
    url.hash = '';
    return url.toString();
  } catch {
    return 'https://www.uregina.ca/';
  }
}

// ---- Typed link transformer (no undefined fields) -----------------
const linkTransform: Transformer = (_tag: string, attribs: Attributes) => {
  try {
    const href = (attribs as Attributes).href; // raw href (may be undefined)
    if (!href) {
      return { tagName: 'span', attribs: {} as Attributes };
    }
    const u = new URL(href, 'https://www.uregina.ca');
    if (!u.hostname.endsWith('uregina.ca')) {
      return { tagName: 'span', attribs: {} as Attributes };
    }
    u.hash = '';
    const attrs: Attributes = {
      href: u.toString(),
      target: '_blank',
      rel: 'noopener'
    };
    return { tagName: 'a', attribs: attrs };
  } catch {
    return { tagName: 'span', attribs: {} as Attributes };
  }
};

export function sanitizeRichHtml(html: string) {
  return sanitizeHtmlLib(html, {
    allowedTags: [
      'p','strong','em','u','a','ul','ol','li','table','thead','tbody','tr','td','th',
      'h1','h2','h3','h4','h5','h6','mark','div','span','br'
    ],
    allowedAttributes: {
      a: ['href','title','target','rel'],
      td: ['colspan','rowspan'],
      th: ['colspan','rowspan'],
      '*': ['role'] // keep minimal ARIA if you want
    },
    transformTags: {
      a: linkTransform
    },
    allowedSchemes: ['https','http']
  });
}

// highlight helper (unchanged)
export function highlightHtml(html: string, tokens: string[]) {
  const toks = Array.from(new Set(tokens.filter(t => t && t.length >= 3)));
  if (!toks.length) return html;
  const parts = html.split(/(<[^>]+>)/g);
  const re = new RegExp(`\\b(${toks.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
  return parts.map(seg =>
    seg.startsWith('<') && seg.endsWith('>') ? seg : seg.replace(re, '<mark>$1</mark>')
  ).join('');
}