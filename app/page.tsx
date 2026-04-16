"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    console.log("検索結果:", data); // ←追加（確認用）
    setResults(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>ファッション検索</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="例：ワンピ"
      />

      <button onClick={handleSearch}>検索</button>

      <div style={{ marginTop: 20 }}>
        {results.length === 0 && <p>結果なし</p>}

        {results.map((item, index) => (
  <div key={index} style={{ marginBottom: "20px" }}>
    <h2>{item.title}</h2>

    <img
      src={item.dupe_image}
      alt={item.title}
      style={{ width: "200px" }}
    />

    <br />

    <a href={item.link} target="_blank">
      楽天で見る
    </a>
  </div>
))}
      </div>
    </div>
  );
}