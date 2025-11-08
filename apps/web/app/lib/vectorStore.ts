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
  return path.join(process.cwd(), '..', '..', '..', 'data', 'passages.json');
}

export async function loadStore() {
  if (CACHE) return CACHE;
  const passages: Passage[] = JSON.parse(await fs.readFile(dataPath(), 'utf-8'));
  const index = passages.map(p => Float32Array.from(p.vector));
  CACHE = { passages, index };
  return CACHE;
}