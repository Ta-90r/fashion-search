"use client";
import { useState, useEffect } from "react";

export default function Home() {
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
    let updated = favorites.some(f => f.id === product.id)
      ? favorites.filter(f => f.id !== product.id)
      : [...favorites, product];
    setFavorites(updated);
    localStorage.setItem("lookmatch_favs", JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (!selectedFile) return alert("探したいお洋服のスクショを選んでね！👗");
    setLoading(true);
    setResults([]); // 前回の結果をクリア
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/image-search", { method: "POST", body: formData });
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setResults(data);
          setShowFavorites(false);
        } else {
          alert("クローゼットの中から似ている服が見つかりませんでした。別のスクショを試すか、アイテムを増やしてみてね！");
        }
      } else {
        alert("うまく解析できなかったよ。もう一度試してみてね！");
      }
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました。");
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
          <p style={{ fontSize: "12px", color: "#666", textAlign: "center", margin: "0 0 15px 0", fontWeight: "bold" }}>
            憧れの服のスクショから、激似のプチプラ服をAIが見つけます ✨
          </p>
          
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            {previewUrl ? (
              <img src={previewUrl} style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "12px", marginBottom: "10px", border: "2px solid #7b5cff" }} />
            ) : (
              <div style={{ height: "140px", border: "2px dashed #e2dfff", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#b5aeff", fontSize: "13px", background: "#fcfbfe" }}>
                📸 ここに推し服のスクショをアップロード
              </div>
            )}
            <input type="file" accept="image/*" onChange={onFileChange} style={{ display: "block", margin: "10px auto", fontSize: "12px" }} />
          </div>

          <button onClick={handleSearch} disabled={loading} style={{ width: "100%", background: loading ? "#ccc" : "#7b5cff", color: "#fff", border: "none", padding: "16px", borderRadius: "14px", fontWeight: "bold", fontSize: "16px", boxShadow: "0 4px 15px rgba(123, 92, 255, 0.3)" }}>
            {loading ? "AIがプチプラ服を厳選中..." : "激似プチプラ服をみつける 💖"}
          </button>
        </section>
      )}

      <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>{showFavorites ? "保存したお気に入り" : "AIが見つけた激似アイテム"}</h2>

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
              {favorites.some(f => f.id === item.id) ? "❤️" : "🤍"}
            </button>

            <img src={item.dupe_image} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
            
            <div style={{ padding: "12px" }}>
              <p style={{ fontSize: "11px", fontWeight: "bold", height: "2.6em", overflow: "hidden", lineHeight: "1.3", margin: 0 }}>{item.title}</p>
              <p style={{ color: "#7b5cff", fontWeight: "900", fontSize: "15px", margin: "8px 0" }}>¥{item.price?.toLocaleString()}</p>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "#333", color: "#fff", textAlign: "center", padding: "10px", borderRadius: "10px", fontSize: "11px", textDecoration: "none", fontWeight: "bold" }}>ショップでみる</a>
            </div>
          </div>
        ))}
      </div>

      {(showFavorites ? favorites : results).length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa", fontSize: "13px" }}>
          {showFavorites ? "お気に入りはまだありません 🌷" : "スクショをアップすると、ここに激似のプチプラ服が並ぶよ 👗"}
        </div>
      )}
    </div>
  );
}