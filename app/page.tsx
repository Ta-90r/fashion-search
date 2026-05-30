"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // 🔽 左側サイドバー用の設定状態（ステート）
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
    setResults([]);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      // 💡 カテゴリとスタイル選択をAPIに一緒に送信する
      formData.append("category", category);
      formData.append("styleTone", styleTone);

      const res = await fetch("/api/image-search", { method: "POST", body: formData });
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setResults(data);
          setShowFavorites(false);
        } else {
          alert("選んだ条件に合う激似プチプラ服が見つかりませんでした。別の組み合わせやスクショを試してね！");
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
    <div style={{ background: "#F8F9FD", minHeight: "100vh", fontFamily: "sans-serif", color: "#333" }}>
      
      {/* 💳 1. 上部：広告・キャンペーンバナーエリア */}
      <div style={{ background: "linear-gradient(90deg, #7b5cff 0%, #aa99ff 100%)", color: "#fff", padding: "15px 20px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "2px", right: "10px", fontSize: "9px", opacity: 0.7 }}>PR</div>
        <h3 style={{ margin: "0 0 5px 0", fontSize: "15px", fontWeight: "bold" }}>✨ プチプラファッション大特集祭 ✨</h3>
        <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>GRL・SHOPLISTの今週の新作・トレンドワンピが最大50%OFF！詳細は各ショップでチェック</p>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
        
        {/* ヘッダーエリア */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "#fff", padding: "15px 25px", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <h1 onClick={() => setShowFavorites(false)} style={{ color: "#7b5cff", fontSize: "26px", fontWeight: "900", cursor: "pointer", margin: 0 }}>LookMatch 💜</h1>
          <button onClick={() => setShowFavorites(!showFavorites)} style={{ background: "#7b5cff15", color: "#7b5cff", border: "none", padding: "10px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" }}>
            {showFavorites ? "🔍 検索画面に戻る" : `❤️ 保存したお気に入り (${favorites.length})`}
          </button>
        </header>

        {/* 2カラムメインコンテナ */}
        <div style={{ display: "block" }}>
          
          <div style={{ width: "100%", display: "table", tableLayout: "fixed" }}>
            <div style={{ display: "table-row" }}>
              
              {/* 📂 左側サイドバー：検索・カテゴリ条件設定 (幅 320px) */}
              <div style={{ display: "table-cell", width: "320px", verticalAlign: "top", paddingRight: "20px" }}>
                <div style={{ background: "#fff", borderRadius: "20px", padding: "25px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #EBF0FF" }}>
                  <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "20px", borderBottom: "2px solid #7b5cff", paddingBottom: "8px", color: "#444" }}>🔍 カテゴリで探す</h2>
                  
                  {/* 条件1：服の種類 */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#666", marginBottom: "8px" }}>服の種類 (Category)</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #DCE2F5", background: "#F9FAFE", fontSize: "14px", color: "#333", outline: "none" }}
                    >
                      <option value="">すべての種類</option>
                      <option value="ワンピース">👗 ワンピース・セットアップ</option>
                      <option value="トップス">👚 トップス・シャツ・ニット</option>
                      <option value="ボトムス">👖 スカート・パンツ</option>
                      <option value="アウター">🧥 ジャケット・コート</option>
                    </select>
                  </div>

                  {/* 条件2：雰囲気・系統 */}
                  <div style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#666", marginBottom: "8px" }}>雰囲気・スタイル (Style / Tone)</label>
                    <select 
                      value={styleTone} 
                      onChange={(e) => setStyleTone(e.target.value)}
                      style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #DCE2F5", background: "#F9FAFE", fontSize: "14px", color: "#333", outline: "none" }}
                    >
                      <option value="">すべてのスタイル</option>
                      <option value="フェミニン">✨ フェミニン・あざと可愛い（snidel風）</option>
                      <option value="大人ギャル">💋 フレンチガーリー・大人ギャル（Darich風）</option>
                      <option value="きれいめ">上品・きれいめお嬢様</option>
                      <option value="カジュアル">量産型・カジュアル・トレンド</option>
                    </select>
                  </div>

                  <div style={{ fontSize: "11px", color: "#99A3C4", lineHeight: "1.5", background: "#F4F6FC", padding: "12px", borderRadius: "10px" }}>
                    💡 左側で種類を絞り込むと、AIがその条件にぴったり沿ったプチプラ服を優先的にクローゼットから選び出します！
                  </div>
                </div>
              </div>

              {/* 📸 右側メインエリア：スクショアップロード ＆ 結果表示 */}
              <div style={{ display: "table-cell", verticalAlign: "top" }}>
                
                {!showFavorites && (
                  <div style={{ background: "#fff", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 20px rgba(123,92,255,0.04)", border: "1px solid #EBF0FF", marginBottom: "25px" }}>
                    <div style={{ textTransform: "uppercase", fontSize: "11px", color: "#7b5cff", fontWeight: "bold", letterSpacing: "1px", marginBottom: "8px" }}>Generated Content Search</div>
                    <h2 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 20px 0" }}>憧れの服のスクショをアップロード</h2>

                    <div style={{ border: "2px dashed #DCE2F5", borderRadius: "16px", padding: "30px", textAlign: "center", background: "#FAFBFFA0", marginBottom: "20px", position: "relative" }}>
                      {previewUrl ? (
                        <img src={previewUrl} style={{ maxHeight: "250px", maxWidth: "100%", objectFit: "contain", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }} />
                      ) : (
                        <div style={{ padding: "20px 0" }}>
                          <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>📸</span>
                          <span style={{ color: "#7b5cff", fontWeight: "bold", fontSize: "14px", display: "block" }}>Click to upload an image</span>
                          <span style={{ color: "#999", fontSize: "12px", marginTop: "5px", display: "block" }}>ここに推し服のスクリーンショットをドロップ</span>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={onFileChange} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                    </div>

                    <button 
                      onClick={handleSearch} 
                      disabled={loading} 
                      style={{ width: "100%", background: loading ? "#ccc" : "#7b5cff", color: "#fff", border: "none", padding: "16px", borderRadius: "12px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 4px 15px rgba(123, 92, 255, 0.2)", transition: "all 0.2s" }}
                    >
                      {loading ? "AIが指定された種類・スタイルから激似服を厳選中..." : "クローゼットから激似プチプラ服を見つける 💖"}
                    </button>
                  </div>
                )}

                {/* 検索結果セクション */}
                <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#444", display: "flex", alignItems: "center" }}>
                  {showFavorites ? "❤️ 保存したお気に入りリスト" : "✨ AIが見つけた激似プチプラアイテム"}
                </h2>

                <div style={{ display: "table", width: "100%" }}>
                  <div style={{ margin: "-8px", display: "block" }}>
                    
                    {/* グリッドレイアウトの代用（table/inline-block） */}
                    <div style={{ width: "100%" }}>
                      {(showFavorites ? favorites : results).map((item, i) => (
                        <div key={i} style={{ display: "inline-block", width: "33.333%", padding: "8px", verticalAlign: "top", boxSizing: "border-box" }}>
                          <div style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", position: "relative", border: "1px solid #EBF0FF", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                            
                            {!showFavorites && (
                              <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(123, 92, 255, 0.95)", color: "#fff", fontSize: "11px", padding: "5px 10px", borderRadius: "20px", fontWeight: "bold", zIndex: 1, boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                                Match {item.matchScore}%
                              </div>
                            )}

                            <button 
                              onClick={() => toggleFavorite(item)}
                              style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(255, 255, 255, 0.9)", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
                            >
                              {favorites.some(f => f.id === item.id) ? "❤️" : "🤍"}
                            </button>

                            <img src={item.dupe_image} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
                            
                            <div style={{ padding: "15px" }}>
                              <p style={{ fontSize: "13px", fontWeight: "bold", height: "2.6em", overflow: "hidden", lineHeight: "1.3", margin: "0 0 8px 0", color: "#333" }}>{item.title}</p>
                              <p style={{ color: "#7b5cff", fontWeight: "900", fontSize: "16px", margin: "0 0 12px 0" }}>¥{item.price?.toLocaleString()}</p>
                              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "#111", color: "#fff", textAlign: "center", padding: "12px", borderRadius: "10px", fontSize: "12px", textDecoration: "none", fontWeight: "bold", transition: "background 0.2s" }}>ショップで詳細をみる</a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                {(showFavorites ? favorites : results).length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa", fontSize: "14px", background: "#fff", borderRadius: "16px", border: "1px dashed #DCE2F5" }}>
                    {showFavorites ? "お気に入りはまだありません 🌷" : "左側で種類を選んでスクショをアップすると、ここに激似お洋服が並ぶよ 👗"}
                  </div>
                )}

              </div>

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}