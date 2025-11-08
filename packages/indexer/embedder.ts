import { pipeline } from '@xenova/transformers';

let pipe: any;
export async function getEmbedder() {
  if (!pipe) pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  return pipe;
}
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const embed = await getEmbedder();
  const out: number[][] = [];
  for (const t of texts) {
    const res = await embed(t, { pooling: 'mean', normalize: true });
    out.push(Array.from(res.data as Float32Array));
  }
  return out;
}