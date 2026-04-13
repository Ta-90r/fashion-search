"use client";

import { useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [image, setImage] = useState<File | null>(null);

  const handleSearch = async () => {
    const res = await fetch("/api/image-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">検索</h1>

      {/* 🔽 文字検索 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="例：ワンピース"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-2 py-1"
        />
        <button onClick={handleSearch} className="bg-black text-white px-3">
          検索
        </button>
      </div>

      {/* 🔽 画像アップロード（UIだけ） */}
      <input
        type="file"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="mb-4"
      />

      {/* 🔽 結果 */}
      <div className="grid grid-cols-2 gap-4">
        {results.map((item: any, i: number) => (
          <div key={i} className="border p-2">
            <img src={item.dupe_image} className="w-full" />
            <p>{item.title}</p>
            <p>¥{item.price}</p>

            <a href={item.link} target="_blank">
              <button className="bg-pink-500 text-white px-2 py-1 mt-2">
                楽天で見る
              </button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}