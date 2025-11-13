"use client";

import React, { useState, FormEvent } from "react";

type AskResponse = {
  answer?: string;
  sources?: { url: string; title?: string }[];
  [key: string]: any;
};

export default function HomePage() {
  const [siteUrl, setSiteUrl] = useState("https://www.uregina.ca/");
  const [question, setQuestion] = useState("What scholarships are available?");
  const [answer, setAnswer] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [indexing, setIndexing] = useState(false);
  const [asking, setAsking] = useState(false);

  // 🔹 Index button handler
  const handleIndexSite = async () => {
    setError(null);
    setAnswer("");
    setIndexing(true);
    try {
      const res = await fetch("/api/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: siteUrl }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Index failed: ${res.status}`);
      }

      setAnswer("✅ Site indexed successfully. You can ask questions now.");
    } catch (err: any) {
      setError(err.message || "Failed to index site.");
    } finally {
      setIndexing(false);
    }
  };

  // 🔹 Ask button / form submit handler
  const handleAsk = async (e: FormEvent) => {
    e.preventDefault(); // ❗ stop full page reload
    setError(null);
    setAnswer("");
    setAsking(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          url: siteUrl, // include if your backend expects it
        }),
      });

      const data: AskResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Ask failed: ${res.status}`);
      }

      if (data.answer) {
        setAnswer(data.answer);
      } else {
        // fallback: show raw JSON if schema is slightly different
        setAnswer(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setError(err.message || "Failed to get answer.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 16px",
      }}
    >
      <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "32px" }}>
        Askian Beta – RAG Chat
      </h1>

      {/* Index + Ask form */}
      <form
        onSubmit={handleAsk}
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* URL row */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="url"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
          <button
            type="button"
            onClick={handleIndexSite}
            disabled={indexing}
            style={{
              padding: "10px 16px",
              borderRadius: "4px",
              border: "1px solid #333",
              backgroundColor: indexing ? "#eee" : "#f5f5f5",
              cursor: indexing ? "default" : "pointer",
            }}
          >
            {indexing ? "Indexing…" : "Index Site"}
          </button>
        </div>

        {/* Question row */}
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this site…"
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            disabled={asking}
            style={{
              padding: "10px 20px",
              borderRadius: "4px",
              border: "1px solid #333",
              backgroundColor: asking ? "#eee" : "#f5f5f5",
              cursor: asking ? "default" : "pointer",
            }}
          >
            {asking ? "Thinking…" : "Ask"}
          </button>
        </div>
      </form>

      {/* Status / answer */}
      <section
        style={{
          width: "100%",
          maxWidth: "1100px",
          marginTop: "24px",
          fontSize: "14px",
          lineHeight: 1.5,
        }}
      >
        {error && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "4px",
              backgroundColor: "#ffe5e5",
              color: "#a00",
              marginBottom: "12px",
            }}
          >
            ❌ {error}
          </div>
        )}

        {(answer || indexing || asking) && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              whiteSpace: "pre-wrap",
              backgroundColor: "#fafafa",
            }}
          >
            {answer ||
              (indexing && "Indexing site…") ||
              (asking && "Getting answer…")}
          </div>
        )}
      </section>
    </main>
  );
}