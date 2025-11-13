// tests/ranker.test.ts
import { describe, it, expect } from 'vitest';
import { chunk } from '../apps/widget/src/chunker';
// ^ adjust this path if your chunker is somewhere else

describe('chunker', () => {
  it('splits large text into overlapping chunks', () => {
    const text = 'Para1. End.\n\nPara2 sentence A. Para2 sentence B.\n\nPara3.';

    const chunks = chunk(text, { maxChars: 20, overlap: 5 });

    // basic expectations – you can tweak these if needed
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toContain('Para1');
    expect(chunks.join(' ')).toContain('Para2 sentence A');
    expect(chunks.join(' ')).toContain('Para3');
  });
});