"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Fashion Search</h1>

      <Link href="/search">
        検索ページへ
      </Link>
    </div>
  );
}