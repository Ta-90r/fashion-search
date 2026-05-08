import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    
    // 自分のサイトのURL（本番環境に合わせて自動切換）
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fashion-search-010.vercel.app";
    
    const res = await fetch(`${baseUrl}/api/rakuten-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    });

    if (!res.ok) {
      return NextResponse.json([]);
    }

    const items = await res.json();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Search Route Error:", error);
    return NextResponse.json([]);
  }
}