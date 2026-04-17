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

  const handleSearch = async () => {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword }),
    });

    const data = await res.json();
    setResults(data);
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        background: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>
        💖 LOOK MATCH
      </h1>
      <p style={{ marginBottom: "20px" }}>
        ハイブランド風 → プチプラ検索
      </p>

      {/* 検索欄 */}
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="例：スナイデル ワンピ"
        style={{
          padding: "10px",
          width: "250px",
          marginRight: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleSearch}
        style={{
          background: "#ff4d6d",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        検索
      </button>

      {/* ワンタップ検索 */}
      <div style={{ marginTop: "15px" }}>
        <button onClick={() => setKeyword("ワンピ")}>ワンピ</button>
        <button onClick={() => setKeyword("ニット")} style={{ marginLeft: 10 }}>
          ニット
        </button>
        <button
          onClick={() => setKeyword("スカート")}
          style={{ marginLeft: 10 }}
        >
          スカート
        </button>
      </div>

      {/* 結果 */}
      <div style={{ marginTop: "30px" }}>
        {results.length === 0 && <p>結果なし</p>}

        {results.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #eee",
              borderRadius: "16px",
              padding: "15px",
              marginBottom: "20px",
              background: "white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            }}
          >
            <h2>{item.title}</h2>

            <Image
              src={item.dupe_image}
              alt={item.title}
              width={300}
              height={300}
              style={{ borderRadius: "10px" }}
            />

            <p style={{ marginTop: "10px" }}>
              💰 {item.price}円
            </p>

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                background: "#ff4d6d",
                color: "white",
                padding: "10px 15px",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              💖 楽天で見る
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}