import { NextRequest, NextResponse } from 'next/server';
import { embedTextsLocal, cosineSim } from '../../lib/embed';
import { loadStore } from '../../lib/vectorStore';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const query = String(body?.query ?? '').trim();
  const topK = Math.max(1, Math.min(10, Number(body?.topK ?? 5)));
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

  const { passages, index } = await loadStore().catch(() => ({ passages: [], index: [] as any[] }));
  if (!passages.length || !index.length) {
    return NextResponse.json({
      answer: "I don't know about this. I can only answer from the indexed website.",
      sources: [],
    });
  }

  const [qvec] = await embedTextsLocal([query]);
  const scored = index.map((vec, i) => ({ i, score: cosineSim(qvec, vec) }));
  scored.sort((a, b) => b.score - a.score);
  const picks = scored.slice(0, topK);
  const best = picks[0]?.score ?? 0;

  // Threshold: only answer if we have a reasonably similar passage
  if (best < 0.15) {
    return NextResponse.json({
      answer: "I don't know about this. I can only answer from the indexed website.",
      sources: picks.map(p => ({ score: p.score, ...passages[p.i] })),
    });
  }

  // Build a concise answer from top passages
  const topPassages = picks.map(p => passages[p.i]);
  const answer = topPassages
    .map((p, idx) => `${idx + 1}. ${p.title || p.url}: ${p.text}`)
    .join('\n\n');

  return NextResponse.json({
    answer,
    sources: picks.map(p => ({ score: p.score, ...passages[p.i] })),
  });
}
