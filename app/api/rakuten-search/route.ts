import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, maxPrice } = body; // フロントから価格を受け取る

    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();
    const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY?.trim();

    if (!APP_ID || !ACCESS_KEY) {
      console.error("環境変数が足りません");
      return NextResponse.json([]);
    }

    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    const url = new URL(baseUrl);
    
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("accessKey", ACCESS_KEY);
    // 「プチプラ」を自動で加えて、GRL系の安くて可愛い服をヒットしやすくします
    url.searchParams.append("keyword", `${keyword || ""} プチプラ`);
    url.searchParams.append("hits", "20");
    url.searchParams.append("formatVersion", "2");

    // 価格上限の設定がある場合は追加
    if (maxPrice) {
      url.searchParams.append("maxPrice", maxPrice.toString());
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://fashion-search-010.vercel.app/"
      },
      cache: 'no-store'
    });

    const data = await res.json();

    if (!res.ok || data.errors) {
      console.error("楽天APIエラー:", JSON.stringify(data));
      return NextResponse.json([]);
    }

    // 画像URLを確実に取得し、かつ高画質化する処理
    const items = (data.Items || []).map((item: any) => {
      const i = item.Item || item;
      // 楽天APIの画像URLは配列の中にあったり文字列だったりするので、安全に取得
      let rawImg = "";
      if (i.mediumImageUrls && i.mediumImageUrls.length > 0) {
        rawImg = typeof i.mediumImageUrls[0] === 'string' ? i.mediumImageUrls[0] : i.mediumImageUrls[0].imageUrl;
      }

      return {
        title: i.itemName,
        price: i.itemPrice,
        // 画像サイズ制限（?_ex=...）を消して、できるだけ綺麗に表示
        dupe_image: rawImg ? rawImg.split('?')[0] : "https://via.placeholder.com/300",
        link: i.itemUrl,
      };
    });

    return NextResponse.json(items);

  } catch (error) {
    console.error("API実行エラー:", error);
    return NextResponse.json([]);
  }
}