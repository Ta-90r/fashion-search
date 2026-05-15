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
    
    // ジャンルIDを強力に固定（楽天の最新ID）
    if (k.match(/ワンピース|ワンピ|ドレス/)) genreId = "501911";
    else if (k.match(/トップス|シャツ|ブラウス/)) genreId = "100371";
    else if (k.match(/スカート/)) genreId = "501912";
    else if (k.match(/パンツ|ズボン/)) genreId = "501913";
    else if (k.match(/バッグ|カバン/)) genreId = "101070";
    else if (k.match(/靴|サンダル|スニーカー/)) genreId = "101105";

    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    const url = new URL(baseUrl);
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("accessKey", ACCESS_KEY);
    
    // 検索語が「ワンピース」なら「ワンピース プチプラ」として検索
    url.searchParams.append("keyword", `${k} プチプラ`);
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