import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json([]);
    }

    const APP_ID = process.env.RAKUTEN_APP_ID;
    
    if (!APP_ID) {
      console.error("APP_IDが環境変数に設定されていません");
      return NextResponse.json([]);
    }

    // 2026年最新仕様の楽天APIエンドポイント
    const url = new URL("https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401");
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("keyword", keyword);
    url.searchParams.append("hits", "20");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://fashion-search-010.vercel.app",
      },
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("楽天APIエラー詳細:", data);
      return NextResponse.json([]);
    }

    if (!data.Items || !Array.isArray(data.Items)) {
      return NextResponse.json([]);
    }

    // 画面が表示しやすい形式に整える
    const results = data.Items.map((item: any) => {
      const i = item.Item;
      return {
        title: i.itemName,
        price: i.itemPrice,
        dupe_image: i.mediumImageUrls?.[0]?.imageUrl || "https://via.placeholder.com/300",
        link: i.itemUrl,
        // 画面側のエラーを防ぐための空データ
        high_brand: "",
        dupe_brand: "楽天市場"
      };
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json([]);
  }
}