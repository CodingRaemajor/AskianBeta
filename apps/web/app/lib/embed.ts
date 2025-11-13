import type { Tensor } from '@xenova/transformers';

let pipelinePromise: Promise<any> | null = null;

async function getPipeline() {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline } = await import('@xenova/transformers');
      // sentence-transformers compatible mini model
      return pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    })();
  }
  return pipelinePromise;
}

function meanPool(tensor: Tensor): number[] {
  // tensor shape: [1, tokens, dim]
  const data = tensor.data as Float32Array | number[];
  const dims = tensor.dims; // [1, tokens, dim]
  const tokens = dims[1];
  const dim = dims[2];
  const out = new Float32Array(dim);
  for (let t = 0; t < tokens; t++) {
    const offset = t * dim;
    for (let d = 0; d < dim; d++) out[d] += (data as any)[offset + d];
  }
  const inv = 1 / Math.max(1, tokens);
  for (let d = 0; d < dim; d++) out[d] *= inv;
  // L2 normalize
  let norm = 0;
  for (let d = 0; d < dim; d++) norm += out[d] * out[d];
  norm = Math.sqrt(norm) || 1;
  for (let d = 0; d < dim; d++) out[d] /= norm;
  return Array.from(out);
}

export async function embedTextsLocal(texts: string[]): Promise<number[][]> {
  const fe = await getPipeline();
  const embeddings: number[][] = [];
  for (const t of texts) {
    const res = await fe(t, { pooling: 'mean', normalize: true });
    // Some versions return pooled directly; handle both
    if (Array.isArray(res)) {
      embeddings.push(res as unknown as number[]);
    } else if (res?.data && res?.dims) {
      embeddings.push(meanPool(res as Tensor));
    } else if (res?.tensor?.data) {
      embeddings.push(meanPool(res.tensor as Tensor));
    } else {
      throw new Error('Unexpected embedding output');
    }
  }
  return embeddings;
}

export function cosineSim(a: number[] | Float32Array, b: number[] | Float32Array): number {
  let dot = 0, na = 0, nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = (a as any)[i];
    const y = (b as any)[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return dot / ((Math.sqrt(na) || 1) * (Math.sqrt(nb) || 1));
}
