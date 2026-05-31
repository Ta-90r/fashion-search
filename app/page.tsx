"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [category, setCategory] = useState("");
  const [styleTone, setStyleTone] = useState("");

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

  // 選択クリア機能
  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const toggleFavorite = (product: any) => {
    let updated = favorites.some(f => f.id === product.id)
      ? favorites.filter(f => f.id !== product.id)
      : [...favorites, product];
    setFavorites(updated);
    localStorage.setItem("lookmatch_favs", JSON.stringify(updated));
  };

  const handleSearch = async () => {
    // 💡 修正点：スクショがなくても、カテゴリかスタイルが選ばれていれば検索できるようにしました！
    if (!selectedFile && !category && !styleTone) {
      return alert("スクショを選ぶか、カテゴリ・スタイルを指定してね！👗");
    }
    
    setLoading(true);
    setResults([]);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("category", category);
      formData.append("styleTone", styleTone);

      const res = await fetch("/api/image-search", { method: "POST", body: formData });
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setResults(data);
          setShowFavorites(false);
        } else {
          alert("条件に合うお洋服がクローゼットにありませんでした。他の条件を試してね！");
        }
      } else {
        alert("うまく検索できなかったよ。もう一度試してみてね！");
      }
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#F8F9FD", minHeight: "100vh", fontFamily: "sans-serif", color: "#333", paddingBottom: "40px" }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .search-btn:active { background-color: #6644ff !important; }
        .shop-btn:active { background-color: #444 !important; }
      `}} />

      {/* 💳 1. 最上部：広告バナー */}
      <div style={{ background: "linear-gradient(90deg, #7b5cff 0%, #aa99ff 100%)", color: "#fff", padding: "12px 15px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "2px", right: "8px", fontSize: "8px", opacity: 0.6 }}>PR</div>
        <h3 style={{ margin: "0 0 3px 0", fontSize: "13px", fontWeight: "bold", letterSpacing: "0.5px" }}>✨ プチプラファッション大特集祭 ✨</h3>
        <p style={{ margin: 0, fontSize: "11px", opacity: 0.9, lineHeight: "1.3" }}>GRL・SHOPLISTの新作ワンピ最大50%OFF！詳細は各ショップへ</p>
      </div>

      <div style={{ maxWidth: "500px", margin: "0 auto", padding: "15px" }}>
        
        {/* ヘッダー */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", background: "#fff", padding: "12px 18px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <h1 onClick={() => setShowFavorites(false)} style={{ color: "#7b5cff", fontSize: "22px", fontWeight: "900", cursor: "pointer", margin: 0 }}>LookMatch 💜</h1>
          <button onClick={() => setShowFavorites(!showFavorites)} style={{ background: "#7b5cff15", color: "#7b5cff", border: "none", padding: "8px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}>
            {showFavorites ? "🔍 検索に戻る" : `❤️ お気に入り (${favorites.length})`}
          </button>
        </header>

        {!showFavorites && (
          <>
            {/* 📂 2. カテゴリ・スタイル選択エリア */}
            <section style={{ background: "#fff", borderRadius: "20px", padding: "18px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", border: "1px solid #EBF0FF", marginBottom: "15px" }}>
              <h2 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "15px", color: "#444", display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "6px" }}>📂</span> カテゴリ・スタイルで絞り込む
              </h2>
              
              <div style={{ marginBottom: "12px" }}>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #DCE2F5", background: "#F9FAFE", fontSize: "14px", color: "#333", outline: "none" }}
                >
                  <option value="">👗 すべての種類（ワンピース、トップス等）</option>
                  <option value="ワンピース">👗 ワンピース・セットアップ</option>
                  <option value="トップス">👚 トップス・シャツ・ニット</option>
                  <option value="ボトムス">👖 スカート・パンツ</option>
                  <option value="アウター">🧥 ジャケット・コート</option>
                </select>
              </div>

              <div>
                <select 
                  value={styleTone} 
                  onChange={(e) => setStyleTone(e.target.value)}
                  style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #DCE2F5", background: "#F9FAFE", fontSize: "14px", color: "#333", outline: "none" }}
                >
                  <option value="">✨ すべてのスタイル（フェミニン、ギャル等）</option>
                  <option value="フェミニン">✨ フェミニン・あざと可愛い（snidel風）</option>
                  <option value="大人ギャル">💋 フレンチガーリー・大人ギャル（Darich風）</option>
                  <option value="きれいめ">💎 上品・きれいめお嬢様</option>
                  <option value="カジュアル">🎈 量産型・カジュアル・トレンド</option>
                </select>
              </div>
            </section>

            {/* 📸 3. スクショアップロード ＆ 検索実行エリア */}
            <section style={{ background: "#fff", borderRadius: "20px", padding: "20px", boxShadow: "0 4px 15px rgba(123,92,255,0.03)", border: "1px solid #EBF0FF", marginBottom: "20px" }}>
              <div style={{ textTransform: "uppercase", fontSize: "10px", color: "#7b5cff", fontWeight: "bold", letterSpacing: "1px", marginBottom: "6px" }}>Generated Content Search</div>
              <h2 style={{ fontSize: "16px", fontWeight: "bold", margin: "0 0 15px 0" }}>探したい服のスクショをUP（任意）</h2>

              <div style={{ border: "2px dashed #DCE2F5", borderRadius: "14px", padding: "20px 10px", textAlign: "center", background: "#FAFBFFA0", marginBottom: "15px", position: "relative" }}>
                {previewUrl ? (
                  <div>
                    <img src={previewUrl} style={{ maxHeight: "200px", maxWidth: "100%", objectFit: "contain", borderRadius: "10px" }} />
                    <button onClick={(e) => { e.stopPropagation(); clearSelection(); }} style={{ display: "block", margin: "10px auto 0", background: "#ff4a4a", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", position: "relative", zIndex: 10 }}>画像を消す</button>
                  </div>
                ) : (
                  <div style={{ padding: "10px 0" }}>
                    <span style={{ fontSize: "32px", display: "block", marginBottom: "5px" }}>📸</span>
                    <span style={{ color: "#7b5cff", fontWeight: "bold", fontSize: "13px", display: "block" }}>Click to upload an image</span>
                    <span style={{ color: "#999", fontSize: "11px", marginTop: "4px", display: "block" }}>スクショを選ぶ、またはここにドロップ</span>
                  </div>
                )}
                {!previewUrl && <input type="file" accept="image/*" onChange={onFileChange} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />}
              </div>

              <button 
                onClick={handleSearch} 
                disabled={loading} 
                className="search-btn"
                style={{ width: "100%", background: loading ? "#ccc" : "#7b5cff", color: "#fff", border: "none", padding: "15px", borderRadius: "12px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", boxShadow: "0 4px 12px rgba(123, 92, 255, 0.2)", transition: "background-color 0.1s" }}
              >
                {loading ? "プチプラクローゼットを検索中..." : selectedFile ? "激似プチプラ服を見つける 💖" : "この条件でカタログを見る ✨"}
              </button>
            </section>
          </>
        )}

        {/* 検索結果タイトル */}
        <h2 style={{ fontSize: "15px", fontWeight: "bold", marginBottom: "12px", color: "#444" }}>
          {showFavorites ? "❤️ 保存したお気に入り" : "✨ 見つかったプチプラアイテム"}
        </h2>

        {/* 🛍️ 4. 商品表示カード */}
        <div style={{ display: "flex", flexWrap: "wrap", margin: "0 -6px" }}>
          {(showFavorites ? favorites : results).map((item, i) => (
            <div key={i} style={{ width: "50%", padding: "6px", boxSizing: "border-box" }}>
              <div style={{ background: "#fff", borderRadius: "14px", overflow: "hidden", position: "relative", border: "1px solid #EBF0FF", boxShadow: "0 2px 6px rgba(0,0,0,0.01)" }}>
                
                {!showFavorites && item.matchScore < 100 && (
                  <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(123, 92, 255, 0.92)", color: "#fff", fontSize: "10px", padding: "3px 7px", borderRadius: "20px", fontWeight: "bold", zIndex: 1 }}>
                    Match {item.matchScore}%
                  </div>
                )}

                <button 
                  onClick={() => toggleFavorite(item)}
                  style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(255, 255, 255, 0.9)", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                >
                  {favorites.some(f => f.id === item.id) ? "❤️" : "🤍"}
                </button>

                <img src={item.dupe_image} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
                
                <div style={{ padding: "10px" }}>
                  <p style={{ fontSize: "11px", fontWeight: "bold", height: "2.6em", overflow: "hidden", lineHeight: "1.3", margin: "0 0 6px 0", color: "#333" }}>{item.title}</p>
                  <p style={{ color: "#7b5cff", fontWeight: "900", fontSize: "14px", margin: "0 0 8px 0" }}>¥{item.price?.toLocaleString()}</p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="shop-btn" style={{ display: "block", background: "#111", color: "#fff", textAlign: "center", padding: "9px 5px", borderRadius: "8px", fontSize: "11px", textDecoration: "none", fontWeight: "bold", transition: "background-color 0.1s" }}>ショップでみる</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(showFavorites ? favorites : results).length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa", fontSize: "12px", background: "#fff", borderRadius: "14px", border: "1px dashed #DCE2F5" }}>
            {showFavorites ? "お気に入りはまだありません 🌷" : "項目を選んで検索すると、ここに可愛い服が並ぶよ 👗"}
          </div>
        )}

      </div>
    </div>
  );
}