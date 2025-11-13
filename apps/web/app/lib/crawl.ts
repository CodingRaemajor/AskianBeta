import { sanitizeRichHtml } from './sanitize';
import { chunk } from '../../../widget/src/chunker';

export type CrawlPage = {
  url: string;
  title: string;
  html: string;
  text: string;
};

function absoluteUrl(u: string, base: string): string | null {
  try {
    const url = new URL(u, base);
    return url.toString();
  } catch {
    return null;
  }
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return (m?.[1] ?? '').trim();
}

function stripScriptsStyles(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

function htmlToText(html: string): string {
  const clean = stripScriptsStyles(html)
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n$&');
  const tmp = clean.replace(/<[^>]+>/g, ' ');
  return tmp.replace(/\s+/g, ' ').trim();
}

export async function crawlWebsite(rootUrl: string, maxPages = 25): Promise<CrawlPage[]> {
  const origin = new URL(rootUrl).origin;
  const q: string[] = [rootUrl];
  const seen = new Set<string>();
  const pages: CrawlPage[] = [];

  while (q.length && pages.length < maxPages) {
    const url = q.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);

    let html = '';
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      html = await r.text();
    } catch {
      continue;
    }

    const sanitized = sanitizeRichHtml(html);
    const title = extractTitle(sanitized) || url;
    const text = htmlToText(sanitized);
    pages.push({ url, title, html: sanitized, text });

    // collect links
    const links = Array.from(sanitized.matchAll(/<a[^>]+href="([^"]+)"[^>]*>/gi)).map(m => m[1]);
    for (const href of links) {
      const abs = absoluteUrl(href, url);
      if (!abs) continue;
      if (!abs.startsWith(origin)) continue; // same site only
      if (abs.includes('#')) continue;
      if (!seen.has(abs)) q.push(abs);
    }
  }

  return pages;
}

export function chunkPages(pages: CrawlPage[], maxChars = 1200, overlap = 100) {
  return pages.flatMap((p, i) => {
    const parts = chunk(p.text, { maxChars, overlap });
    return parts.map((text, j) => ({
      id: `${i}-${j}`,
      url: p.url,
      title: p.title,
      text,
      html: undefined as string | undefined,
    }));
  });
}
