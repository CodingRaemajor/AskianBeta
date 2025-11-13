// ranker.test.ts
import { chunk } from './chunker';

describe('chunker', () => {
  it('splits large text into overlapping chunks', () => {
    const text = 'Para1. End.\n\nPara2 sentence A. Para2 sentence B.\n\nPara3.';
    const parts = chunk(text, { maxChars: 20, overlap: 5 });
    expect(parts.length).toBeGreaterThan(1);
    // ensure overlap behavior roughly holds
    for (let i = 1; i < parts.length; i++) {
      const prev = parts[i - 1];
      const cur = parts[i];
      const tail = prev.slice(-5);
      expect(cur.includes(tail)).toBe(true);
    }
  });
});