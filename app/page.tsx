"use client";

import { useState, useEffect } from "react";
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
  const [favorites, setFavorites] = useState<number[]>([]);
const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ✅ 初期ロード
  useEffect(() => {
    const saved = localStorage.getItem("fav");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // ✅ お気に入り
  const toggleFavorite = (index: number) => {
    let updated;

    if (favorites.includes(index)) {
      updated = favorites.filter((i) => i !== index);
    } else {
      updated = [...favorites, index];
    }

    setFavorites(updated);
    localStorage.setItem("fav", JSON.stringify(updated));
  };

  // ✅ テキスト検索
  const handleSearch = async () => {
  setLoading(true);

  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword }),
    });

    console.log("res:", res);

    const data = await res.json();

    console.log("data:", data);

    setResults(data);
  } catch (e) {
    console.error("検索エラー:", e);
  }

  setLoading(false);
};

  // ✅ スクショ検索
  const handleImageSearch = async (file: File) => {
  setLoading(true);

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ keyword }),
});
  const data = await res.json();

  console.log("AI keyword:", data.keyword); // ←これ重要

  const searchRes = await fetch("/api/search", {
    method: "POST",
    body: JSON.stringify({ keyword: data.keyword }),
  });

  const results = await searchRes.json();

  setResults(results);
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

      <h2 style={{ textAlign: "center" }}>📸 スクショで探す</h2>

      {/* 検索 */}
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
        </button>

        {/* ✅ スクショアップ */}
        <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }}
/>
      </div>

      <button
  onClick={() => {
    if (selectedFile) {
      handleImageSearch(selectedFile);
    } else {
      alert("画像を選択してね");
    }
  }}
>
  画像で検索
</button>

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
              background: "#fff",
              borderRadius: "20px",
              padding: "15px",
              marginBottom: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <Image
              src={item.dupe_image}
              alt={item.title}
              width={300}
              height={300}
              style={{ borderRadius: "12px" }}
            />

            <button
              onClick={() => toggleFavorite(index)}
              style={{
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              {favorites.includes(index) ? "❤️" : "🤍"}
            </button>

            <h3>{item.title}</h3>

            <p style={{ color: "#888" }}>
              {item.high_brand} → {item.dupe_brand}
            </p>

            <p style={{ fontWeight: "bold" }}>¥{item.price}</p>

            <a
              href={item.link}
              target="_blank"
              style={{
                display: "inline-block",
                background: "#c084fc",
                color: "#fff",
                padding: "10px 15px",
                borderRadius: "10px",
                marginTop: "10px",
              }}
            >
              購入する
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}