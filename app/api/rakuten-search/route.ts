import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    const APP_ID = process.env.RAKUTEN_APP_ID;

    if (!keyword) return NextResponse.json([]);
    if (!APP_ID) {
      console.error("RAKUTEN_APP_ID が設定されていません");
      return NextResponse.json([]);
    }

    // 1. URLからはパラメータを極力減らし、シンプルにします
    const url = `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?keyword=${encodeURIComponent(keyword)}&hits=20`;

    // 2. 【2026年最新の送り方】IDをヘッダー(x-rakuten-applicationid)に載せます
    // これにより、URLの解析エラーでIDが消える問題を物理的に回避します
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://fashion-search-010.vercel.app",
        "x-rakuten-applicationid": APP_ID, // ヘッダーでIDを伝える
        "applicationId": APP_ID            // 念のため予備でもう一つ
      },
    });

    const data = await res.json();

    // 楽天側からエラーが返ってきた場合の詳細ログ
    if (!res.ok || data.errors || data.error) {
      console.error("楽天APIエラー応答:", JSON.stringify(data));
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
    console.error("サーバー内部エラー:", error);
    return NextResponse.json([]);
  }
}