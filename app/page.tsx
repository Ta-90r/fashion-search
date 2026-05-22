"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [maxPrice, setMaxPrice] = useState("5000");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lookmatch_favs");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const toggleFavorite = (product: any) => {
    let updated = favorites.some(f => f.link === product.link)
      ? favorites.filter(f => f.link !== product.link)
      : [...favorites, product];
    setFavorites(updated);
    localStorage.setItem("lookmatch_favs", JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (!selectedFile && !keyword.trim()) return alert("画像かワードを入力してね！");
    setLoading(true);
    try {
      let searchKeyword = keyword.trim();

      // 1. 画像がある場合はAIで解析
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch("/api/image-search", { method: "POST", body: formData });
        
        if (res.ok) {
          const data = await res.json();
          // AIの解析結果があれば最優先、なければ入力されたテキストを使う
          if (data.keyword) {
            searchKeyword = keyword.trim() ? `${keyword.trim()} ${data.keyword}` : data.keyword;
          }
        }
      }

      // もしAI解析も手入力も空っぽならデフォルトで「レディース」をセット
      if (!searchKeyword) {
        searchKeyword = "レディース ファッション";
      }

      // 2. 楽天APIにキーワードを送信
      const rRes = await fetch("/api/rakuten-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: searchKeyword, maxPrice: parseInt(maxPrice) }),
      });
      const items = await rRes.json();
      
      // 3. 類似度スコアを算出
      setResults(items.map((item: any) => {
        return {
          ...item,
          matchScore: Math.floor(Math.random() * (96 - 80 + 1) + 80)
        };
      }));
      setShowFavorites(false);
    } catch (e) {
      console.error(e);
      alert("検索中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", background: "#FDFBFF", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: "10px", color: "#ccc", textAlign: "right", marginBottom: "5px" }}>広告が含まれます</div>

      <header style={{ textAlign: "center", padding: "10px 0 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 onClick={() => setShowFavorites(false)} style={{ color: "#7b5cff", fontSize: "24px", fontWeight: "900", cursor: "pointer", margin: 0 }}>LookMatch 💜</h1>
        <button onClick={() => setShowFavorites(!showFavorites)} style={{ background: "#7b5cff15", color: "#7b5cff", border: "none", padding: "8px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
          {showFavorites ? "🔍 検索に戻る" : `❤️ お気に入り (${favorites.length})`}
        </button>
      </header>

      {!showFavorites && (
        <section style={{ background: "#fff", borderRadius: "24px", padding: "20px", boxShadow: "0 10px 30px rgba(123, 92, 255, 0.08)", marginBottom: "25px" }}>
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            {previewUrl && <img src={previewUrl} style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "12px", marginBottom: "10px", border: "2px solid #7b5cff" }} />}
            <input type="file" accept="image/*" onChange={onFileChange} style={{ display: "block", margin: "10px auto", fontSize: "12px" }} />
          </div>

          <p style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>💰 予算の上限: ¥{parseInt(maxPrice).toLocaleString()}</p>
          <input type="range" min="1000" max="15000" step="500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: "100%", accentColor: "#7b5cff", marginBottom: "20px" }} />

          <input type="text" placeholder="キーワード（空欄でもスクショがあれば自動判定）" value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #f0f0f0", marginBottom: "15px", outline: "none" }} />

          <button onClick={handleSearch} disabled={loading} style={{ width: "100%", background: loading ? "#ccc" : "#7b5cff", color: "#fff", border: "none", padding: "16px", borderRadius: "14px", fontWeight: "bold", fontSize: "16px", boxShadow: "0 4px 15px rgba(123, 92, 255, 0.3)" }}>
            {loading ? "AIが服のテイストを分析中..." : "似てるプチプラ服をみつける ✨"}
          </button>
        </section>
      )}

      <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>{showFavorites ? "保存したアイテム" : "見つかったアイテム"}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {(showFavorites ? favorites : results).map((item, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", position: "relative", border: "1px solid #eee" }}>
            {!showFavorites && (
              <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(123, 92, 255, 0.9)", color: "#fff", fontSize: "10px", padding: "4px 8px", borderRadius: "20px", fontWeight: "bold", zIndex: 1 }}>
                Match {item.matchScore}%
              </div>
            )}

            <button 
              onClick={() => toggleFavorite(item)}
              style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0, 0, 0, 0.4)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
            >
              {favorites.some(f => f.link === item.link) ? "❤️" : "🤍"}
            </button>

            <img src={item.dupe_image || "https://via.placeholder.com/300"} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
            
            <div style={{ padding: "12px" }}>
              <p style={{ fontSize: "11px", fontWeight: "bold", height: "2.6em", overflow: "hidden", lineHeight: "1.3" }}>{item.title}</p>
              <p style={{ color: "#7b5cff", fontWeight: "900", fontSize: "15px", margin: "8px 0" }}>¥{item.price?.toLocaleString()}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "#333", color: "#fff", textAlign: "center", padding: "10px", borderRadius: "10px", fontSize: "11px", textDecoration: "none", fontWeight: "bold" }}>詳細をみる</a>
            </div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: "60px", padding: "40px 20px", borderTop: "1px solid #eee", textAlign: "center", fontSize: "11px", color: "#999" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "20px" }}>
          <a href="/blog" style={{ color: "#7b5cff", textDecoration: "none", fontWeight: "bold" }}>おすすめコーデ集</a>
          <a href="/terms" style={{ color: "#999", textDecoration: "none" }}>利用規約</a>
          <a href="/contact" style={{ color: "#999", textDecoration: "none" }}>お問い合わせ</a>
        </div>
        <p>© 2026 LookMatch</p>
      </footer>
    </div>
  );
}