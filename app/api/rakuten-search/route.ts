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
    
    // 【最も確実なノイズ除去】
    // 楽天の「レディースファッション（100371）」の部屋に完全に限定します。
    // これにより、メンズ、キッズ、その他関係のない雑貨は一撃で100%排除されます。
    url.searchParams.append("genreId", "100371"); 
    
    // 検索ワードを楽天が拒絶しない「適切な長さ」にギュッと凝縮
    // 最もノイズになりやすい「靴下・下着・帽子」だけをスマートに除外
    const cleanKeyword = `${keyword || ""} SHOPLIST GRL プチプラ -靴下 -帽子 -下着`;
    
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