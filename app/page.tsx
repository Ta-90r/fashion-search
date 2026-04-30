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
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);

  // 初期ロード
  useEffect(() => {
    const saved = localStorage.getItem("fav");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }

    fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword: "" }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
      })
      .catch((err) => {
        console.error("初期ロード失敗:", err);
      });
  }, []);

  // お気に入り切り替え
  const toggleFavorite = (index: number) => {
    let updated: number[];

    if (favorites.includes(index)) {
      updated = favorites.filter((i) => i !== index);
    } else {
      updated = [...favorites, index];
    }

    setFavorites(updated);
    localStorage.setItem("fav", JSON.stringify(updated));
  };

  // テキスト検索
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

  // スクショ検索（AIなし版）
  const handleImageSearch = async (file: File) => {
    try {
      setLoading(true);

      const fileName = file.name.toLowerCase();
      let tags: string[] = [];

      // 仮タグ生成
      if (fileName.includes("white")) tags.push("白");
      if (fileName.includes("black")) tags.push("黒");
      if (fileName.includes("onepiece")) tags.push("ワンピース");
      if (fileName.includes("korea")) tags.push("韓国");
      if (fileName.includes("girly")) tags.push("ガーリー");
      if (fileName.includes("setup")) tags.push("セットアップ");

      if (tags.length === 0) {
        tags = ["人気"];
      }

      setGeneratedTags(tags);

      const searchKeyword = tags.join(" ");

      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: searchKeyword,
        }),
      });

      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("画像検索エラー:", error);
      alert("画像検索失敗");
    } finally {
      setLoading(false);
    }
  };

  // メイン検索ボタン
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
      {/* タイトル */}
      <h1
        style={{
          textAlign: "center",
          color: "#7b5cff",
        }}
      >
        LookMatch 💜
      </h1>

      <h2 style={{ textAlign: "center" }}>
        📸 スクショで探す
      </h2>

      {/* 人気ランキング */}
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

      {/* お気に入り一覧 */}
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

      {/* 検索UI */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
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

      {/* 自動生成タグ */}
      {generatedTags.length > 0 && (
        <div
          style={{
            marginBottom: "30px",
            background: "#ffffff",
            padding: "20px",
            borderRadius: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ color: "#7b5cff" }}>
            🏷 自動生成タグ
          </h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {generatedTags.map((tag, index) => (
              <span
                key={index}
                style={{
                  background: "#f3e8ff",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  fontSize: "14px",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <p style={{ textAlign: "center" }}>
          検索中...
        </p>
      )}

      {/* 検索結果 */}
      <div>
        {results.length === 0 && !loading && (
          <p style={{ textAlign: "center" }}>
            結果なし
          </p>
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
              src={item.dupe_image || "https://via.placeholder.com/300"}
              alt={item.title || "商品画像"}
              width={300}
              height={300}
              style={{
                borderRadius: "12px",
              }}
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

            <p>
              {item.high_brand} → {item.dupe_brand}
            </p>

            <p>¥{item.price || "-"}</p>

            <a
              href={item.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              購入する
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}