import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json([]);
    }

    const APP_ID = process.env.RAKUTEN_APP_ID;
    
    if (!APP_ID) {
      console.error("APP_ID未設定");
      return NextResponse.json([]); // エラーでも空配列を返す
    }

    // 2026年最新ドメイン
    const url = new URL("https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401");
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("keyword", keyword);
    url.searchParams.append("hits", "20");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://fashion-search-010.vercel.app/",
      },
    });

    const data = await res.json();

    // 楽天からエラーが返ってきた場合の処理
    if (!res.ok || data.error) {
      console.error("楽天APIエラー:", data.error_description || data.error);
      return NextResponse.json([]); // 画面を壊さないために空配列を返す
    }

    if (!data.Items || !Array.isArray(data.Items)) {
      return NextResponse.json([]);
    }

    const items = data.Items.map((item: any) => {
      const i = item.Item;
      return {
        title: i.itemName || "商品名なし",
        price: i.itemPrice || 0,
        dupe_image: i.mediumImageUrls?.[0]?.imageUrl || "https://via.placeholder.com/300",
        link: i.itemUrl || "#",
      };
    });

    return NextResponse.json(items);

  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json([]); // 最悪の事態でも空配列を返す
  }
}