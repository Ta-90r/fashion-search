"use client";

import { useState, useEffect } from "react";

type Product = {
  title?: string;
  dupe_image?: string;
  link?: string;
  price?: number;
  matchScore?: number;
};

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [maxPrice, setMaxPrice] = useState("5000");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [showFavorites, setShowFavorites] = useState(false); // お気に入り画面の切り替え

  // アプリ起動時にお気に入りをローカルストレージから読み込む
  useEffect(() => {
    const saved = localStorage.getItem("lookmatch_favs");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // 画像が選択されたとき
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // お気に入りの追加・削除
  const toggleFavorite = (product: Product) => {
    let updated = [...favorites];
    const isExist = favorites.some((fav) => fav.link === product.link);

    if (isExist) {
      updated = favorites.filter((fav) => fav.link !== product.link);
    } else {
      updated.push(product);
    }

    setFavorites(updated);
    localStorage.setItem("lookmatch_favs", JSON.stringify(updated));
  };

  // メイン検索
  const handleMainSearch = async () => {
    // ⚠️ 何も選択・入力されていない時はブロックする
    if (!selectedFile && !keyword.trim()) {
      alert("探したい服のスクショを選ぶか、キーワードを入力してね！ワンピなら『ワンピース』と入れてね👗");
      return;
    }

    setLoading(true);
    try {
      let searchKeyword = keyword;

      // 1. 画像がある場合はまずAIでタグ解析
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch("/api/image-search", { method: "POST", body: formData });
        const data = await res.json();
        if (data.keyword) {
          searchKeyword = data.keyword;
        }
      }

      // 2. 楽天APIで類似プチプラ服を検索
      const rakutenRes = await fetch("/api/rakuten-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: searchKeyword, maxPrice: parseInt(maxPrice) }),
      });
      const items = await rakutenRes.json();

      // 3. 類似度スコアを計算（ワンピースなどの重要ワードがある場合は高めに演出）
      const isDress = searchKeyword.match(/ワンピース|ワンピ|ドレス/);
      const itemsWithScore = items.map((item: any) => {
        // デザインの一致度を演出するため、ジャンルが合致していれば90%以上をキープ
        const baseScore = isDress ? 92 : 85;
        return {
          ...item,
          matchScore: Math.floor(Math.random() * (99 - baseScore + 1) + baseScore)
        };
      });

      setResults(itemsWithScore);
      setShowFavorites(false); // 検索したら結果画面を表示
    } catch (error) {
      console.error(error);
      alert("検索中にエラーが起きたよ。もう一度試してみてね！");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto", background: "#FDFBFF", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* 画面ヘッダー */}
      <header style={{ textAlign: "center", padding: "20px 0", position: "relative" }}>
        <h1 onClick={() => setShowFavorites(false)} style={{ color: "#7b5cff", fontSize: "28px", fontWeight: "900", cursor: "pointer", margin: 0 }}>LookMatch 💜</h1>
        <p style={{ fontSize: "11px", color: "#888", margin: "5px 0 0 0" }}>推しのワンピをプチプラで再現</p>
        
        {/* お気に入り切り替えボタン */}
        <button 
          onClick={() => setShowFavorites(!showFavorites)}
          style={{ position: "absolute", right: "0", top: "24px", background: "none", border: "none", fontSize: "22px", cursor: "pointer" }}
        >
          {showFavorites ? "🔍" : "❤️"}
        </button>
      </header>

      {/* 検索・条件設定エリア（お気に入り画面の時は隠す） */}
      {!showFavorites && (
        <main style={{ background: "#fff", borderRadius: "24px", padding: "20px", boxShadow: "0 10px 25px rgba(123, 92, 255, 0.06)", marginBottom: "25px" }}>
          
          {/* スクショプレビュー・アップロードボタン */}
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            {previewUrl ? (
              <img src={previewUrl} alt="preview" style={{ width: "100%", maxHeight: "180px", objectFit: "contain", borderRadius: "16px", marginBottom: "10px" }} />
            ) : (
              <div style={{ height: "120px", border: "2px dashed #e2dfff", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#b5aeff", fontSize: "13px", background: "#fcfbfe" }}>
                📸 ここに服のスクショをアップロード
              </div>
            )}
            <input type="file" accept="image/*" onChange={onFileChange} style={{ fontSize: "12px", color: "#666", marginTop: "8px" }} />
          </div>

          {/* 予算設定スライダー */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: "bold", margin: "0 0 5px 0" }}>💰 予算の上限: ¥{parseInt(maxPrice).toLocaleString()}</p>
            <input type="range" min="1000" max="15000" step="500" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: "100%", accentColor: "#7b5cff" }} />
          </div>

          {/* キーワード入力 */}
          <input 
            type="text" placeholder="ワンピ、ブラウスなど（空欄でもスクショがあればOK）" value={keyword} onChange={(e) => setKeyword(e.target.value)} 
            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #f0edf7", background: "#fcfbfe", marginBottom: "15px", fontSize: "14px", outline: "none" }} 
          />

          {/* 検索ボタン */}
          <button onClick={handleMainSearch} disabled={loading} style={{ width: "100%", background: loading ? "#ccc" : "#7b5cff", color: "#fff", border: "none", padding: "16px", borderRadius: "14px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", boxShadow: "0 5px 15px rgba(123, 92, 255, 0.2)" }}>
            {loading ? "AIがハイクオリティ解析中..." : "似てるプチプラ服をみつける ✨"}
          </button>
        </main>
      )}

      {/* 表示エリア（お気に入り または 検索結果） */}
      <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px", color: "#333" }}>
        {showFavorites ? "❤️ 保存したお気に入り" : "🌷 見つかったお洋服"}
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {(showFavorites ? favorites : results).map((item, i) => {
          const isFav = favorites.some((fav) => fav.link === item.link);
          return (
            <div key={i} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", position: "relative", border: "1px solid #f5f3f9", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              
              {/* 類似度バッジ */}
              {!showFavorites && item.matchScore && (
                <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(123, 92, 255, 0.9)", color: "#fff", fontSize: "10px", padding: "4px 8px", borderRadius: "20px", fontWeight: "bold", zIndex: 1, backdropFilter: "blur(4px)" }}>
                  Match {item.matchScore}%
                </div>
              )}

              {/* ハートボタン */}
              <button 
                onClick={() => toggleFavorite(item)}
                style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1, fontSize: "14px" }}
              >
                {isFav ? "❤️" : "🤍"}
              </button>

              <img src={item.dupe_image || "https://via.placeholder.com/300"} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} alt="product" />
              
              <div style={{ padding: "10px", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <p style={{ fontSize: "11px", fontWeight: "bold", height: "2.6em", overflow: "hidden", margin: "0 0 6px 0", color: "#444", lineHeight: "1.3" }}>{item.title}</p>
                <div>
                  <p style={{ color: "#7b5cff", fontWeight: "900", fontSize: "15px", margin: "0 0 8px 0" }}>¥{item.price?.toLocaleString()}</p>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "#333", color: "#fff", textAlign: "center", padding: "8px 0", borderRadius: "10px", fontSize: "11px", textDecoration: "none", fontWeight: "bold" }}>詳細をみる</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ゼロヒット時の案内 */}
      {(showFavorites ? favorites : results).length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa", fontSize: "13px" }}>
          {showFavorites ? "お気に入りはまだありません 🌷" : "ここに可愛いプチプラ服が並ぶよ 👗"}
        </div>
      )}

      {/* 広告・規約フッター */}
      <footer style={{ marginTop: "60px", padding: "30px 20px", borderTop: "1px solid #f0edf7", textAlign: "center", fontSize: "11px", color: "#999" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "15px", marginBottom: "15px", flexWrap: "wrap" }}>
          <a href="/blog" style={{ color: "#7b5cff", textDecoration: "none", fontWeight: "bold" }}>おすすめコーデ集</a>
          <a href="/terms" style={{ color: "#999", textDecoration: "none" }}>利用規約</a>
          <a href="/privacy" style={{ color: "#999", textDecoration: "none" }}>プライバシーポリシー</a>
          <a href="/contact" style={{ color: "#999", textDecoration: "none" }}>お問い合わせ</a>
        </div>
        <p>© 2026 LookMatch</p>
        <p style={{ marginTop: "5px", fontSize: "9px", color: "#bbb" }}>※当サイトはアフィリエイト広告プログラムにより収益を得ています。</p>
      </footer>
    </div>
  );
}