// src/chunker.ts

// Legacy-style options (from your first version)
export type ChunkOpts = {
  maxChars: number;
  overlap?: number;
};

// Flexible options (with defaults)
export type ChunkerOptions = {
  maxChars?: number;
  overlap?: number;
};

const DEFAULTS: Required<ChunkerOptions> = {
  maxChars: 1200,
  overlap: 100,
};

/**
 * Split text into logical pieces:
 * - First by blank-line-separated paragraphs
 * - Then by sentence boundaries (., !, ? followed by space + capital/number)
 */
export function smartSplit(text: string): string[] {
  const paras = text.split(/\n{2,}/g).flatMap((p) => {
    const trimmed = p.trim();
    if (!trimmed) return [];
    return trimmed.split(/(?<=[.!?])\s+(?=[A-Z0-9])/g);
  });
  return paras.filter(Boolean);
}

// Overloads so both call styles work:
//
// chunk(text, { maxChars: 512 })
// chunk(text, { maxChars: 1200, overlap: 100 })
// chunk(text, { overlap: 50 })  // uses default maxChars
export function chunk(text: string, opts: ChunkOpts): string[];
export function chunk(text: string, options?: ChunkerOptions): string[];
export function chunk(
  text: string,
  optionsOrOpts: ChunkOpts | ChunkerOptions = {}
): string[] {
  // Merge with defaults and enforce sane bounds
  const merged: ChunkerOptions = { ...DEFAULTS, ...optionsOrOpts };

  const maxChars = Math.max(1, merged.maxChars ?? DEFAULTS.maxChars);
  const overlap = Math.max(
    0,
    Math.min(merged.overlap ?? DEFAULTS.overlap, maxChars - 1)
  );

  const parts = smartSplit(text);
  if (parts.length === 0) return [];

  const out: string[] = [];
  let cur: string[] = [];
  let curLen = 0;

  const push = () => {
    if (!cur.length) return;
    const joined = cur.join(" ").trim();
    if (!joined) {
      cur = [];
      curLen = 0;
      return;
    }
    out.push(joined);

    if (overlap > 0) {
      const tail = joined.slice(-overlap);
      cur = tail ? [tail] : [];
      curLen = tail.length;
    } else {
      cur = [];
      curLen = 0;
    }
  };

  for (const p of parts) {
    const addLen = (curLen ? 1 : 0) + p.length; // +1 for space if needed
    if (curLen + addLen > maxChars) {
      push();
    }

    cur.push(p);
    curLen += addLen;

    if (curLen >= maxChars) {
      push();
    }
  }

  push();
  return out;
}

export default chunk;