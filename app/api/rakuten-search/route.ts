import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyword, maxPrice } = body;

    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();
    const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY?.trim();

    if (!APP_ID || !ACCESS_KEY) return NextResponse.json([]);

    let genreId = ""; 
    const k = keyword || "";
    
    // ジャンル固定（レディースファッションのIDを最優先）
    if (k.match(/ワンピース|ワンピ|ドレス/)) genreId = "501911";
    else if (k.match(/トップス|シャツ|ブラウス/)) genreId = "100371";
    else if (k.match(/スカート/)) genreId = "501912";
    else if (k.match(/パンツ|ズボン/)) genreId = "501913";

    const url = new URL("https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401");
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("accessKey", ACCESS_KEY);
    
    // 【精度改善】ノイズを消すための検索ワード構成
    // 「レディース」を強制付与し、かつマイナス検索（-メンズ -キッズ）でヒートテック等の混入を防ぐ
    url.searchParams.append("keyword", `${k} レディース プチプラ -メンズ -キッズ -子供`);
    url.searchParams.append("hits", "20");
    url.searchParams.append("formatVersion", "2");

    if (genreId) url.searchParams.append("genreId", genreId);
    if (maxPrice) url.searchParams.append("maxPrice", maxPrice.toString());

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