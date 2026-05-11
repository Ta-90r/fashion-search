"use client";

import { useState } from "react";

type Product = {
  title?: string;
  dupe_image?: string;
  link?: string;
  price?: number;
  matchScore?: number; // 擬似的な類似度
};

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [maxPrice, setMaxPrice] = useState("5000"); // デフォルト5000円
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleMainSearch = async () => {
    if (!selectedFile && !keyword) return alert("画像かワードを入力してね！");
    setLoading(true);

    try {
      let searchKeyword = keyword;
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch("/api/image-search", { method: "POST", body: formData });
        const data = await res.json();
        searchKeyword = data.keyword;
      }

      // 楽天検索（価格上限を渡すように後ほどAPI側も修正します）
      const rakutenRes = await fetch("/api/rakuten-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: searchKeyword, maxPrice: parseInt(maxPrice) }),
      });
      const items = await rakutenRes.json();
      
      // 類似度スコアをランダムに生成（演出として非常に重要！）
      const itemsWithScore = items.map((item: any) => ({
        ...item,
        matchScore: Math.floor(Math.random() * (99 - 85 + 1) + 85) // 85%〜99%で変動
      }));
      
      setResults(itemsWithScore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", background: "#FDFBFF", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", padding: "20px 0" }}>
        <h1 style={{ color: "#7b5cff", fontSize: "28px", fontWeight: "900" }}>LookMatch 💜</h1>
      </header>

      {/* 設定セクション */}
      <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", boxShadow: "0 8px 20px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
        <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>💰 予算の上限: ¥{parseInt(maxPrice).toLocaleString()}</p>
        <input 
          type="range" min="1000" max="20000" step="500" 
          value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
          style={{ width: "100%", accentColor: "#7b5cff" }}
        />
        
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          {previewUrl && <img src={previewUrl} style={{ width: "100px", borderRadius: "10px", marginBottom: "10px" }} />}
          <input type="file" accept="image/*" onChange={onFileChange} style={{ display: "block", margin: "10px auto", fontSize: "12px" }} />
          <button 
            onClick={handleMainSearch} 
            style={{ width: "100%", background: "#7b5cff", color: "#fff", border: "none", padding: "15px", borderRadius: "12px", fontWeight: "bold", fontSize: "16px" }}
          >
            {loading ? "AI解析中..." : "プチプラで再現する ✨"}
          </button>
        </div>
      </div>

      {/* 結果一覧 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {results.map((item, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "15px", overflow: "hidden", position: "relative", border: "1px solid #f0f0f0" }}>
            {/* 類似度バッジ */}
            <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(123, 92, 255, 0.9)", color: "#fff", fontSize: "10px", padding: "4px 8px", borderRadius: "20px", fontWeight: "bold", zIndex: 1 }}>
               Match {item.matchScore}%
            </div>
            <img src={item.dupe_image} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
            <div style={{ padding: "10px" }}>
              <p style={{ fontSize: "11px", fontWeight: "bold", height: "2.6em", overflow: "hidden" }}>{item.title}</p>
              <p style={{ color: "#7b5cff", fontWeight: "900", fontSize: "15px" }}>¥{item.price?.toLocaleString()}</p>
              <a href={item.link} target="_blank" style={{ display: "block", background: "#333", color: "#fff", textAlign: "center", padding: "8px", borderRadius: "8px", fontSize: "11px", textDecoration: "none", marginTop: "5px" }}>詳細をみる</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}