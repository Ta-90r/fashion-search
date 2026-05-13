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

    // --- 【強化版】ジャンル判定ロジック ---
    let genreId = ""; 
    const k = keyword || "";
    
    // 特定の単語が含まれる場合、それ以外のジャンルを拾わないようにIDを固定
    if (k.match(/ワンピース|ワンピ|ドレス/)) {
      genreId = "501911"; // レディースワンピース
    } else if (k.match(/トップス|シャツ|ブラウス|カットソー/)) {
      genreId = "100371"; // レディーストップス
    } else if (k.match(/スカート/)) {
      genreId = "501912"; // レディーススカート
    } else if (k.match(/パンツ|ズボン/)) {
      genreId = "501913"; // レディースパンツ
    } else if (k.match(/靴|サンダル|パンプス|スニーカー/)) {
      genreId = "101105"; // レディース靴
    }

    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    const url = new URL(baseUrl);
    
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("accessKey", ACCESS_KEY);
    
    // キーワードを「プチプラ」＋「AIキーワード」に限定し、ノイズを減らす
    url.searchParams.append("keyword", `${k} プチプラ`);
    url.searchParams.append("hits", "20");
    url.searchParams.append("formatVersion", "2");

    // ジャンルが特定できた場合のみ追加
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

    if (!res.ok || data.errors) {
      console.error("楽天APIエラー:", JSON.stringify(data));
      return NextResponse.json([]);
    }

    const items = (data.Items || []).map((item: any) => {
      const i = item.Item || item;
      let imageUrl = "";
      if (i.mediumImageUrls && i.mediumImageUrls.length > 0) {
        const firstImg = i.mediumImageUrls[0];
        imageUrl = typeof firstImg === "string" ? firstImg : firstImg.imageUrl;
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
    console.error("致命的エラー:", error);
    return NextResponse.json([]);
  }
}