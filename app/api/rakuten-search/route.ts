import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();

    if (!APP_ID) return NextResponse.json([]);
    if (!keyword) return NextResponse.json([]);

    // 2026年最新URL
    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    
    // 【究極の対策】新旧すべてのパラメータ名を「これでもか」と詰め込みます
    const params = new URLSearchParams();
    params.append("applicationId", APP_ID); // 旧仕様の名前
    params.append("accessKey", APP_ID);     // 2026年最新の名前
    params.append("keyword", `${keyword} プチプラ`);
    params.append("hits", "20");
    params.append("formatVersion", "2");

    const finalUrl = `${baseUrl}?${params.toString()}`;

    const res = await fetch(finalUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://fashion-search-010.vercel.app",
        // ヘッダー側にも新旧両方の名前でIDを載せる
        "applicationId": APP_ID,
        "accessKey": APP_ID,
        "x-rakuten-applicationid": APP_ID
      },
      cache: 'no-store'
    });

    const data = await res.json();

    // 200が返ってきても、中身にエラーが含まれている場合をチェック
    if (!res.ok || data.errors || data.error) {
      console.error("❌楽天APIエラー最終詳細:", JSON.stringify(data));
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
    console.error("❌通信エラー:", error);
    return NextResponse.json([]);
  }
}