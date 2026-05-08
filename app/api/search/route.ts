import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    
    // 自サイト内の楽天検索APIを呼び出す
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fashion-search-010.vercel.app";
    const res = await fetch(`${baseUrl}/api/rakuten-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    });

    const items = await res.json();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Search API 連携エラー:", error);
    return NextResponse.json([]);
  }
}