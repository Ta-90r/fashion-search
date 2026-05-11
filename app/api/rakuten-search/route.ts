import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();
    const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY?.trim();

    if (!APP_ID || !ACCESS_KEY) return NextResponse.json([]);
    if (!keyword) return NextResponse.json([]);

    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    const url = new URL(baseUrl);
    
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("accessKey", ACCESS_KEY);
    url.searchParams.append("keyword", keyword);
    url.searchParams.append("hits", "20");
    url.searchParams.append("formatVersion", "2");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        // 【重要】管理画面の「アプリケーションURL」と完全に一致させます
        // 末尾の / (スラッシュ) まで含めて固定してください
        "Referer": "https://fashion-search-010.vercel.app/",
        "Origin": "https://fashion-search-010.vercel.app"
      },
      cache: 'no-store'
    });

    const data = await res.json();

    if (!res.ok || data.errors) {
      console.error("❌楽天APIエラー詳細:", JSON.stringify(data));
      return NextResponse.json([]);
    }

    const items = (data.Items || []).map((item: any) => {
      const i = item.Item || item;
      return {
        title: i.itemName,
        price: i.itemPrice,
        dupe_image: i.mediumImageUrls?.[0]?.imageUrl || "https://via.placeholder.com/300",
        link: i.itemUrl,
      };
    });

    return NextResponse.json(items);

  } catch (error) {
    console.error("❌サーバーエラー:", error);
    return NextResponse.json([]);
  }
}