"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [threshold, setThreshold] = useState(0.7);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          match_threshold: threshold,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "search failed");
      }

      setResults(data.results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 600, margin: "auto" }}>
      <h1>Semantic Search</h1>

      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="検索したい文章を入力"
        style={{ width: "100%", height: 100 }}
      />

      <div style={{ marginTop: 12 }}>
        <label>類似度しきい値: {threshold}</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
        />
      </div>

      <button onClick={search} disabled={loading}>
        {loading ? "検索中..." : "検索"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {results.map((r, i) => (
          <li key={i}>
            <strong>{r.similarity.toFixed(2)}</strong> – {r.content}
          </li>
        ))}
      </ul>
    </main>
  );
}
