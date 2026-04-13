"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold" }}>
        Fashion LookMatch 💜
      </h1>

      <p style={{ marginTop: 10 }}>
        画像・テキストで似てる服を検索できます
      </p>

      <div style={{ marginTop: 20 }}>
        <Link href="/search">
          🔍 検索ページへ
        </Link>
      </div>
    </div>
  );
}