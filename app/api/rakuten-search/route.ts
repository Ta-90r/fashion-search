import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, maxPrice } = body;

    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();
    const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY?.trim();

    if (!APP_ID || !ACCESS_KEY) {
      return NextResponse.json({ error: "Config missing" }, { status: 500 });
    }

    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    const url = new URL(baseUrl);
    
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("accessKey", ACCESS_KEY);
    url.searchParams.append("keyword", `${keyword || ""} プチプラ`);
    url.searchParams.append("hits", "20");
    url.searchParams.append("formatVersion", "2");

    if (maxPrice) {
      url.searchParams.append("maxPrice", maxPrice.toString());
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        // 【最重要】ここをあなたのVercelドメインに完全に一致させます
        "Referer": "https://fashion-search-010.vercel.app/", 
        "Origin": "https://fashion-search-010.vercel.app"
      },
      cache: 'no-store'
    });

    const data = await res.json();

    if (!res.ok || data.errors) {
      console.error("❌楽天APIエラー応答:", JSON.stringify(data));
      // エラー時は空配列を返してアプリが落ちないようにする
      return NextResponse.json([]);
    }

    const items = (data.Items || []).map((item: any) => {
      const i = item.Item || item;
      
      // 画像URLを安全に取得
      let imageUrl = "";
      if (i.mediumImageUrls && i.mediumImageUrls.length > 0) {
        const firstImg = i.mediumImageUrls[0];
        imageUrl = typeof firstImg === "string" ? firstImg : firstImg.imageUrl;
      }

      return {
        title: i.itemName,
        price: i.itemPrice,
        // 画像URLを整形（?_ex=... を消すと高画質になります）
        dupe_image: imageUrl ? imageUrl.split("?")[0] : "", 
        link: i.itemUrl,
      };
    });

    return NextResponse.json(items);

  } catch (error) {
    console.error("❌致命的エラー:", error);
    return NextResponse.json([]);
  }
}