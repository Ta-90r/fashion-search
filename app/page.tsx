"use client";

import { useState } from "react";
import Image from "next/image"

type Product = {
  title: string;
  high_brand: string;
  high_image: string;
  dupe_brand: string;
  dupe_image: string;
  link: string;
  price: number;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  const handleSearch = async () => {
  const res = await fetch("/api/search", {
    method: "POST",
    body: JSON.stringify({ keyword }),
  });

  const data = await res.json();
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
      <input
  value={keyword}
  onChange={(e) => setKeyword(e.target.value)}
  placeholder="例：スナイデル ワンピ"
  style={{
    padding: "10px",
    width: "250px",
    marginBottom: "10px"
  }}
/>

      <button onClick={handleSearch}>検索</button>

      <div style={{ marginTop: 20 }}>
        {results.length === 0 && <p>結果なし</p>}

        {results.map((item, index) => (
  <div key={index} style={{ marginBottom: "20px" }}>
    <h2>{item.title}</h2>

<Image
  src={item.dupe_image}
  alt={item.title}
  width={300}
  height={300}
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