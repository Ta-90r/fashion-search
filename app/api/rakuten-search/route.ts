import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();

    if (!APP_ID) {
      console.error("RAKUTEN_APP_ID missing");
      return NextResponse.json([]);
    }

    // 2026年最新URL
    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    
    // 【超重要】URLSearchParamsを使わず、文字列で直接「両方のID」を書きます
    // ログにこれが出てこない場合は、デプロイが失敗しています
    const finalUrl = `${baseUrl}?applicationId=${APP_ID}&accessKey=${APP_ID}&keyword=${encodeURIComponent(keyword)}&hits=20&formatVersion=2`;

    console.log("🔥今度こそ両方送るURL:", finalUrl.replace(APP_ID, "SECRET"));

    const res = await fetch(finalUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://fashion-search-010.vercel.app"
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
        dupe_image: i.mediumImageUrls?.[0]?.imageUrl || i.mediumImageUrls?.[0],
        link: i.itemUrl,
      };
    });

    return NextResponse.json(items);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json([]);
  }
}