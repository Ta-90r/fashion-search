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
    
    // 【自動ジャンル判定】AIが判断した言葉に応じて、楽天の「レディース専用カテゴリ部屋」を自動選択
    if (k.match(/ワンピース|ワンピ|ドレス/)) {
      genreId = "501911"; // レディースワンピース
    } else if (k.match(/トップス|シャツ|ブラウス|カットソー|ニット|Tシャツ/)) {
      genreId = "100371"; // レディーストップス
    } else if (k.match(/スカート/)) {
      genreId = "501912"; // レディーススカート
    } else if (k.match(/パンツ|ズボン|デニム|ボトムス/)) {
      genreId = "501913"; // レディースパンツ
    }

    const url = new URL("https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401");
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("accessKey", ACCESS_KEY);
    
    // ジャンルID（部屋）を固定しつつ、キーワードを流すことで「帽子や靴下」が物理的に出ないようにする
    url.searchParams.append("keyword", `${k} SHOPLIST GRL プチプラ レディース -メンズ -キッズ`);
    url.searchParams.append("hits", "20");
    url.searchParams.append("formatVersion", "2");

    if (genreId) {
      url.searchParams.append("genreId", genreId);
    }
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