export default function Blog() {
  const posts = [
    { title: "2026年夏！GRLで買える骨格ウェーブ向け優勝ワンピ5選", date: "2026.05.13", category: "コーデ集" },
    { title: "憧れブランドをプチプラで再現！LookMatchの賢い使い方", date: "2026.05.10", category: "使い方" },
    { title: "予算3000円！SHOPLISTで見つけた高見えデート服特集", date: "2026.05.08", category: "プチプラ" },
  ];

  return (
    <div style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#7b5cff", marginBottom: "40px" }}>Fashion Blog</h1>
      <div style={{ display: "grid", gap: "20px" }}>
        {posts.map((post, i) => (
          <div key={i} style={{ padding: "20px", border: "1px solid #eee", borderRadius: "16px", cursor: "pointer" }}>
            <span style={{ fontSize: "12px", background: "#7b5cff15", color: "#7b5cff", padding: "4px 8px", borderRadius: "4px" }}>{post.category}</span>
            <h2 style={{ fontSize: "18px", margin: "10px 0" }}>{post.title}</h2>
            <p style={{ fontSize: "12px", color: "#999" }}>{post.date}</p>
          </div>
        ))}
      </div>
      <a href="/" style={{ display: "block", textAlign: "center", marginTop: "40px", color: "#7b5cff", textDecoration: "none" }}>← 検索に戻る</a>
    </div>
  );
}