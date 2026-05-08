import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    const APP_ID = process.env.RAKUTEN_APP_ID;

    if (!keyword) return NextResponse.json([]);
    if (!APP_ID) {
      console.error("APP_IDが環境変数(RAKUTEN_APP_ID)に設定されていません");
      return NextResponse.json([]);
    }

    // 【2026年最新】applicationId ではなく accessKey という名前で送るのが正解です
    const url = new URL("https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401");
    url.searchParams.append("accessKey", APP_ID); // 名前を変更
    url.searchParams.append("keyword", keyword);
    url.searchParams.append("hits", "20");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://fashion-search-010.vercel.app", // 楽天に登録したURL
      },
    });

    const data = await res.json();

    if (!res.ok || data.errors) {
      console.error("楽天APIエラー詳細:", JSON.stringify(data));
      return NextResponse.json([]);
    }

    // データの取り出し方も最新形式に合わせます
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