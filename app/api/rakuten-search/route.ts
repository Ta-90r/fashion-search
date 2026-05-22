import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, maxPrice } = body;

    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();
    const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY?.trim();

    if (!APP_ID || !ACCESS_KEY) return NextResponse.json([]);

    const url = new URL("https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401");
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("accessKey", ACCESS_KEY);
    
    // 【決定版フィルター】
    // ジャンルは広めに「レディースファッション全体(100371)」をベースにします。
    // その上で、絶対に並んでほしくない異物を「マイナス検索（-）」で極限まで削ぎ落とします。
    url.searchParams.append("genreId", "100371"); 
    
    // 帽子、靴下、下着、浴衣、メンズ、キッズなどを徹底除外。これで「洋服（アウター・トップス・ワンピ・パンツ・スカート）」だけが残ります。
    const cleanKeyword = `${keyword || ""} SHOPLIST GRL プチプラ -メンズ -キッズ -子供 -ソックス -靴下 -帽子 -キャップ -ハット -マフラー -手袋 -水着 -浴衣 -下着 -ブラジャー -ショーツ -タイツ -ストッキング`;
    
    url.searchParams.append("keyword", cleanKeyword);
    url.searchParams.append("hits", "20");
    url.searchParams.append("formatVersion", "2");

    if (maxPrice) {
      url.searchParams.append("maxPrice", maxPrice.toString());
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://fashion-search-010.vercel.app/", 
        "Origin": "https://fashion-search-010.vercel.app"
      },
      cache: 'no-store'
    });

    const data = await res.json();
    const items = (data.Items || []).map((item: any) => {
      const i = item.Item || item;
      let imageUrl = "";
      if (i.mediumImageUrls?.[0]) {
        imageUrl = typeof i.mediumImageUrls[0] === "string" ? i.mediumImageUrls[0] : i.mediumImageUrls[0].imageUrl;
      }
      return {
        title: i.itemName,
        price: i.itemPrice,
        dupe_image: imageUrl ? imageUrl.split("?")[0] : "", 
        link: i.itemUrl,
      };
    });

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json([]);
  }
}