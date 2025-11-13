import fs from 'fs/promises';
import path from 'path';

export type Passage = {
  id: string;
  url: string;
  title: string;
  tags: string[];
  text: string;
  vector: number[];
  html?: string;
};

let CACHE: { passages: Passage[]; index: Float32Array[] } | null = null;

function dataPath() {
  // When running dev via `pnpm -C apps/web dev`, CWD is apps/web
  // So root/data is at ../../data
  return path.join(process.cwd(), '..', '..', 'data', 'passages.json');
}

export async function loadStore() {
  if (CACHE) return CACHE;
  const raw: any[] = JSON.parse(await fs.readFile(dataPath(), 'utf-8'));
  // Normalize to Passage shape (tolerate entries without vector/tags)
  const passages: Passage[] = raw.map((r, i) => ({
    id: r.id ?? String(i),
    url: r.url ?? '',
    title: r.title ?? '',
    tags: Array.isArray(r.tags) ? r.tags : [],
    text: r.text ?? '',
    vector: Array.isArray(r.vector) ? r.vector : [],
    html: r.html,
  }));
  const index = passages.map(p => Float32Array.from(p.vector ?? []));
  CACHE = { passages, index };
  return CACHE;
}

export async function saveStore(passages: Passage[]) {
  const file = JSON.stringify(passages, null, 2);
  await fs.writeFile(dataPath(), file, 'utf-8');
  CACHE = { passages, index: passages.map(p => Float32Array.from(p.vector)) };
}