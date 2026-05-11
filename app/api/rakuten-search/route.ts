import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();

    if (!APP_ID) return NextResponse.json([]);
    if (!keyword) return NextResponse.json([]);

    // 【戦略変更】403エラー(Invalid)を回避するため、
    // 最も安定してIDを認識してくれる「ichiba/Item/Search」エンドポイントを使用します。
    const baseUrl = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706";
    
    const params = new URLSearchParams();
    params.append("applicationId", APP_ID);
    params.append("keyword", keyword);
    params.append("format", "json");
    params.append("hits", "20");
    // プチプラを見つけやすくするため、価格の安い順などの要素を後で入れられます

    const finalUrl = `${baseUrl}?${params.toString()}`;

    console.log("🚀安定版URLでリクエスト送信中...");

    const res = await fetch(finalUrl, {
      method: "GET",
      cache: 'no-store'
    });

    const data = await res.json();

    if (data.error || data.errors) {
      console.error("❌楽天APIエラー詳細:", JSON.stringify(data));
      return NextResponse.json([]);
    }

    // データの取り出し
    const items = (data.Items || []).map((item: any) => {
      const i = item.Item;
      return {
        title: i.itemName,
        price: i.itemPrice,
        dupe_image: i.mediumImageUrls?.[0]?.imageUrl || "https://via.placeholder.com/300",
        link: i.itemUrl,
      };
    });

    return NextResponse.json(items);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json([]);
  }
}