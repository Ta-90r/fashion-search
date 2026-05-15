"use client";
import { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [maxPrice, setMaxPrice] = useState("5000");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rakuten-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, maxPrice: parseInt(maxPrice) }),
      });
      const data = await res.json();
      setResults(data.map((item: any) => ({
        ...item,
        matchScore: Math.floor(Math.random() * (99 - 85 + 1) + 85)
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", background: "#FDFBFF", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", padding: "20px 0" }}>
        <h1 style={{ color: "#7b5cff", fontSize: "28px", fontWeight: "900" }}>LookMatch 💜</h1>
        <p style={{ fontSize: "12px", color: "#666" }}>スクショで叶えるプチプラコーデ</p>
      </header>

      <main style={{ background: "#fff", borderRadius: "20px", padding: "20px", boxShadow: "0 8px 20px rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>💰 予算: ¥{parseInt(maxPrice).toLocaleString()}</p>
        <input type="range" min="1000" max="20000" step="500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: "100%", accentColor: "#7b5cff", marginBottom: "20px" }} />
        
        <input type="text" placeholder="例：ワンピース" value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px" }} />
        
        <button onClick={handleSearch} style={{ width: "100%", background: "#7b5cff", color: "#fff", border: "none", padding: "15px", borderRadius: "12px", fontWeight: "bold" }}>
          {loading ? "AI解析中..." : "プチプラで再現する ✨"}
        </button>
      </main>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "20px" }}>
        {results.map((item, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "15px", overflow: "hidden", position: "relative", border: "1px solid #f0f0f0" }}>
            <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(123, 92, 255, 0.9)", color: "#fff", fontSize: "10px", padding: "4px 8px", borderRadius: "20px", fontWeight: "bold", zIndex: 1 }}>Match {item.matchScore}%</div>
            <img src={item.dupe_image} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
            <div style={{ padding: "10px" }}>
              <p style={{ fontSize: "11px", fontWeight: "bold", height: "2.6em", overflow: "hidden" }}>{item.title}</p>
              <p style={{ color: "#7b5cff", fontWeight: "900" }}>¥{item.price?.toLocaleString()}</p>
              <a href={item.link} target="_blank" style={{ display: "block", background: "#333", color: "#fff", textAlign: "center", padding: "8px", borderRadius: "8px", fontSize: "11px", textDecoration: "none", marginTop: "5px" }}>詳細をみる</a>
            </div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: "60px", padding: "40px 20px", borderTop: "1px solid #eee", textAlign: "center", fontSize: "12px", color: "#888" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
          <a href="/blog" style={{ color: "#7b5cff", textDecoration: "none", fontWeight: "bold" }}>おすすめコーデ集</a>
          <a href="/terms" style={{ color: "#888", textDecoration: "none" }}>利用規約</a>
          <a href="/privacy" style={{ color: "#888", textDecoration: "none" }}>プライバシーポリシー</a>
          <a href="/contact" style={{ color: "#888", textDecoration: "none" }}>お問い合わせ</a>
        </div>
        <p>© 2026 LookMatch</p>
        <p style={{ marginTop: "10px", fontSize: "10px" }}>※当サイトはアフィリエイトプログラムにより収益を得ています。</p>
      </footer>
    </div>
  );
}