"use client";

import { useState } from "react";

export default function SearchPage() {
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    const res = await fetch("/api/image-search", {
      method: "POST",
    });

    const data = await res.json();
    console.log("data:", data);

    setResults(data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>検索ページ</h1>

      <button onClick={handleSearch}>
        検索する
      </button>

      <div>
        {results.map((item, i) => (
          <div key={i}>
            <img src={item.dupe_image} width="150" />
            <p>{item.title}</p>
            <a href={item.link} target="_blank">
              楽天で見る
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}