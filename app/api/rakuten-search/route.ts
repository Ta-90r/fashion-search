import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();

    if (!APP_ID) {
      console.error("❌RAKUTEN_APP_IDが設定されていません");
      return NextResponse.json([]);
    }

    if (!keyword) return NextResponse.json([]);

    // 1. 最新のURLを作成
    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    const url = new URL(baseUrl);
    
    // 2. 【最重要】パラメータを accessKey に一本化し、確実に付与します
    // 楽天が「accessKeyをよこせ」と言っているので、その通りに合わせます
    url.searchParams.set("accessKey", APP_ID); 
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("hits", "15");
    url.searchParams.set("formatVersion", "2");

    console.log("🚀最終リクエストURL:", url.toString());

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        // 楽天デベロッパーに登録したドメインと完全に一致させる
        "Referer": "https://fashion-search-010.vercel.app"
      },
      cache: "no-store"
    });

    const data = await res.json();

    // 3. エラー詳細のチェック
    if (!res.ok || data.errors) {
      console.error("❌楽天APIエラー応答:", JSON.stringify(data));
      return NextResponse.json([]);
    }

    const items = (data.Items || []).map((item: any) => {
      const i = item.Item || item;
      return {
        title: i.itemName,
        price: i.itemPrice,
        dupe_image: i.mediumImageUrls?.[0]?.imageUrl || i.mediumImageUrls?.[0],
        link: i.itemUrl,
      };
    });

    return NextResponse.json(items);

  } catch (error) {
    console.error("❌サーバーエラー:", error);
    return NextResponse.json([]);
  }
}