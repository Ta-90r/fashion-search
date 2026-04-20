"use client";

import { useState } from "react";
import Image from "next/image";

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
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);

    const res = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ keyword }),
    });

    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        background: "#f8f6ff",
        minHeight: "100vh",
      }}
    >
      {/* タイトル */}
      <h1 style={{ textAlign: "center", color: "#7b5cff" }}>
        LookMatch 💜
      </h1>

      {/* 検索ボックス */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="例：SNIDEL ワンピ"
          style={{
            padding: "12px",
            width: "70%",
            borderRadius: "20px",
            border: "1px solid #ccc",
          }}
        />

        <br />

        <button
          onClick={handleSearch}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            borderRadius: "20px",
            border: "none",
            background: "#7b5cff",
            color: "white",
            cursor: "pointer",
          }}
        >
          検索
          <input
  type="file"
  accept="image/*"
  onChange={() => {
    alert("スクショ検索は準備中（仮）");
  }}
  style={{ marginTop: "10px" }}
/>
        </button>
      </div>

      {/* ローディング */}
      {loading && <p style={{ textAlign: "center" }}>検索中...</p>}

      {/* 結果 */}
      <div>
        {results.length === 0 && !loading && (
          <p style={{ textAlign: "center" }}>結果なし</p>
        )}

        {results.map((item, index) => (
          <div
            key={index}
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "15px",
              marginBottom: "20px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h2>{item.title}</h2>

            <div style={{ display: "flex", gap: "10px" }}>
              {/* 高級 */}
              <div>
                <p>{item.high_brand}</p>
                <Image
                  src={item.high_image}
                  alt=""
                  width={150}
                  height={150}
                />
              </div>

              {/* プチプラ */}
              <div>
                <p>{item.dupe_brand}</p>
                <Image
                  src={item.dupe_image}
                  alt=""
                  width={150}
                  height={150}
                />
              </div>
            </div>

            <p>¥{item.price}</p>

            <a href={item.link} target="_blank">
              <button
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  borderRadius: "10px",
                  background: "#ff6b81",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                楽天で見る
              </button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}