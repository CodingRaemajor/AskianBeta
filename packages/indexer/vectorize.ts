// vectorize.ts
import type { RequestInit } from 'node-fetch';

export type EmbedResult = { embedding: number[]; text: string };
export type EmbedBatchResult = EmbedResult[];

export async function embedTexts(
  texts: string[],
  {
    apiKey = process.env.OPENAI_API_KEY!,
    model = 'text-embedding-3-small',
    endpoint = 'https://api.openai.com/v1/embeddings',
    fetchImpl = (globalThis as any).fetch as (u: string, i?: RequestInit) => Promise<any>,
  } = {}
): Promise<EmbedBatchResult> {
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');

  // OpenAI caps per-request input length; keep batches small in callers.
  const r = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input: texts, model }),
  });

  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Embedding error: ${r.status} ${body}`);
  }

  const data = await r.json();
  const out: EmbedBatchResult = data?.data?.map((d: any, i: number) => ({
    embedding: d.embedding,
    text: texts[i],
  })) ?? [];

  return out;
}
