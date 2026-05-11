import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    
    // Vercelから2つの値を読み込む
    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();
    const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY?.trim();

    if (!APP_ID || !ACCESS_KEY) {
      console.error("❌環境変数が不足しています (APP_ID または ACCESS_KEY)");
      return NextResponse.json([]);
    }

    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    
    // 【2026年最新仕様】
    // applicationId と accessKey をそれぞれ正しい場所へ割り振ります
    const params = new URLSearchParams();
    params.append("applicationId", APP_ID);
    params.append("accessKey", ACCESS_KEY); // ここに「アクセスキー」を入れる！
    params.append("keyword", keyword);
    params.append("hits", "15");
    params.append("formatVersion", "2");

    const finalUrl = `${baseUrl}?${params.toString()}`;

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
    console.error("❌通信エラー:", error);
    return NextResponse.json([]);
  }
}