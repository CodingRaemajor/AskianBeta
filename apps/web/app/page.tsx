// apps/web/app/page.tsx
"use client";

import { useState } from 'react';

export default function HomePage() {
  const [url, setUrl] = useState('https://www.uregina.ca/');
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('What scholarships are available?');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<any[]>([]);

  async function indexSite(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch('/api/config', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const j = await r.json();
      setAnswer(`Indexed ${j.indexed ?? 0} chunks from site.`);
      setSources([]);
    } catch (e: any) {
      setAnswer(`Indexing failed: ${e?.message ?? e}`);
      setSources([]);
    } finally {
      setBusy(false);
    }
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: q, topK: 4 }),
      });
      const j = await r.json();
      setAnswer(j.answer ?? String(j));
      setSources(j.sources ?? []);
    } catch (e: any) {
      setAnswer(`Ask failed: ${e?.message ?? e}`);
      setSources([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "column",
        gap: "1rem",
        padding: "2rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        maxWidth: 900,
        margin: '0 auto',
      }}
    >
      <h1>Askian Beta – RAG Chat</h1>
      <form onSubmit={indexSite} style={{ display: 'flex', gap: 8, width: '100%' }}>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <button disabled={busy} style={{ padding: '8px 12px' }}>Index Site</button>
      </form>

      <form onSubmit={ask} style={{ display: 'flex', gap: 8, width: '100%' }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Ask a question about the indexed site"
          style={{ flex: 1, padding: 8, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <button disabled={busy} style={{ padding: '8px 12px' }}>Ask</button>
      </form>

      {answer && (
        <div style={{ width: '100%', background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
          <h3>Answer</h3>
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{answer}</pre>
        </div>
      )}

      {!!sources.length && (
        <div style={{ width: '100%' }}>
          <h3>Sources</h3>
          <ul>
            {sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noreferrer">{s.title || s.url}</a> (score: {s.score?.toFixed(3)})
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}