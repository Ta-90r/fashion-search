"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Product = {
  title?: string;
  high_brand?: string;
  high_image?: string;
  dupe_brand?: string;
  dupe_image?: string;
  link?: string;
  price?: number;
  tags?: string[];
  ranking?: number;
};

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 初期ロード（お気に入り）
  useEffect(() => {
  const saved = localStorage.getItem("fav");
  if (saved) {
    setFavorites(JSON.parse(saved));
  }

  fetch("/api/search", {
    method: "POST",
    body: JSON.stringify({ keyword: "" }),
  })
    .then((res) => res.json())
    .then((data) => {
      setResults(data);
    });
}, []);

  // お気に入り切り替え
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

  // 🔍 テキスト検索
  const handleSearch = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword }),
      });

      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("検索エラー:", error);
      alert("検索失敗");
    } finally {
      setLoading(false);
    }
  };

  // 📸 画像検索（仮）
  const handleImageSearch = async (file: File) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/image-search", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // 👉 ここで検索に流す
      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: data.keyword }),
      });

      const results = await searchRes.json();
      setResults(results);
    } catch (error) {
      console.error("画像検索エラー:", error);
      alert("画像検索失敗");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ボタン統一（ここが重要）
  const handleMainSearch = () => {
    if (selectedFile) {
      handleImageSearch(selectedFile);
    } else {
      handleSearch();
    }
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
      <h1 style={{ textAlign: "center", color: "#7b5cff" }}>
        LookMatch 💜
      </h1>

      <h2 style={{ textAlign: "center" }}>
        📸 スクショで探す
      </h2>
      <div
  style={{
    background: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  }}
>
  <h2 style={{ color: "#7b5cff" }}>
    🔥 人気ランキング TOP3
  </h2>

  <div
  style={{
    background: "#ffffff",
    borderRadius: "20px",
    padding: "20px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  }}
>
  <h2 style={{ color: "#7b5cff" }}>
    ❤️ お気に入り一覧
  </h2>

  {results.filter((_, index) => favorites.includes(index)).length === 0 ? (
    <p style={{ color: "#888" }}>
      まだお気に入りがありません
    </p>
  ) : (
    results
      .filter((_, index) => favorites.includes(index))
      .map((item, index) => (
        <div
          key={index}
          style={{
            padding: "12px 0",
            borderBottom: "1px solid #eee",
          }}
        >
          <p style={{ fontWeight: "bold" }}>
            {item.title}
          </p>

          <p style={{ color: "#888" }}>
            {item.high_brand} → {item.dupe_brand}
          </p>

          <p style={{ fontWeight: "bold" }}>
            ¥{item.price || "-"}
          </p>
        </div>
      ))
  )}
</div>

  {results
    .filter((item) => item.ranking)
    .sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
    .slice(0, 3)
    .map((item, index) => (
      <div
        key={index}
        style={{
          padding: "12px 0",
          borderBottom: "1px solid #eee",
        }}
      >
        <p style={{ fontWeight: "bold" }}>
          {item.ranking}位 👑 {item.title}
        </p>

        <p style={{ color: "#888" }}>
          {item.high_brand} → {item.dupe_brand}
        </p>
      </div>
    ))}
</div>

      {/* 検索UI */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="例：SNIDEL ワンピ"
          style={{
            padding: "14px",
            width: "80%",
            borderRadius: "999px",
            border: "1px solid #ddd",
          }}
        />

        <div style={{ marginTop: "15px" }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
          />
        </div>

        <button
          onClick={handleMainSearch}
          style={{
            marginTop: "15px",
            padding: "12px 30px",
            borderRadius: "999px",
            border: "none",
            background: "#7b5cff",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🔍 検索する
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

            <button onClick={() => toggleFavorite(index)}>
              {favorites.includes(index) ? "❤️" : "🤍"}
            </button>

            <h3>{item.title}</h3>

            <p>
              {item.high_brand} → {item.dupe_brand}
            </p>

            <p>¥{item.price}</p>

            <a href={item.link} target="_blank">
              購入する
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}