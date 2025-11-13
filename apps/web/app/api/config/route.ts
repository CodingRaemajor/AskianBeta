import { NextRequest, NextResponse } from 'next/server';
import { crawlWebsite, chunkPages } from '../../lib/crawl';
import { embedTextsLocal } from '../../lib/embed';
import { loadStore, saveStore, type Passage } from '../../lib/vectorStore';

export async function GET() {
  const store = await loadStore().catch(() => null);
  return NextResponse.json({ ok: true, count: store?.passages.length ?? 0 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const url = String(body?.url ?? '');
  const maxPages = Number(body?.maxPages ?? 20);
  const maxChars = Number(body?.maxChars ?? 1200);
  const overlap = Number(body?.overlap ?? 100);
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  try {
    const pages = await crawlWebsite(url, maxPages);
    const chunks = chunkPages(pages, maxChars, overlap);
    const texts = chunks.map(c => c.text);
    const vectors = await embedTextsLocal(texts);

    const out: Passage[] = chunks.map((c, i) => ({
      id: `${c.url}#${c.id}`,
      url: c.url,
      title: c.title,
      tags: [],
      text: c.text,
      vector: vectors[i],
    }));

    await saveStore(out);
    return NextResponse.json({ ok: true, indexed: out.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Indexing failed' }, { status: 500 });
  }
}
