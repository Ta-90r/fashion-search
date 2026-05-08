import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    const APP_ID = process.env.RAKUTEN_APP_ID;

    if (!keyword || !APP_ID) {
      console.error("キーワードまたはAPP_IDが不足しています");
      return NextResponse.json([]);
    }

    // 2026年最新URL
    const url = new URL("https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401");
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("keyword", keyword);
    url.searchParams.append("hits", "20");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://fashion-search-010.vercel.app", // 末尾スラッシュなし
      },
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("楽天APIエラー応答:", data);
      return NextResponse.json([]);
    }

    const items = data.Items?.map((item: any) => ({
      title: item.Item.itemName,
      price: item.Item.itemPrice,
      dupe_image: item.Item.mediumImageUrls?.[0]?.imageUrl || "https://via.placeholder.com/300",
      link: item.Item.itemUrl,
    })) || [];

    return NextResponse.json(items);
  } catch (error) {
    console.error("通信エラー:", error);
    return NextResponse.json([]);
  }
}