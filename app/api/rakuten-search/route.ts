import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    const APP_ID = process.env.RAKUTEN_APP_ID?.trim();

    if (!APP_ID) {
      console.error("❌RAKUTEN_APP_IDが見つかりません");
      return NextResponse.json([]);
    }

    if (!keyword) return NextResponse.json([]);

    // 高級ブランドからプチプラ(GRL等)へ誘導するための検索ワード調整
    // 「ブランド名 プチプラ」などの組み合わせでヒットしやすくします
    const searchKeyword = `${keyword} プチプラ`;

    // 2026年最新URL (あなたのIDはこのドメイン専用です)
    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    
    // パラメータ作成
    const url = new URL(baseUrl);
    url.searchParams.append("applicationId", APP_ID); // あなたのIDはここに入れます
    url.searchParams.append("keyword", searchKeyword);
    url.searchParams.append("hits", "20");
    url.searchParams.append("formatVersion", "2");
    // プチプラに絞るために、あえて5,000円以下などの制限を入れるのもアリです
    // url.searchParams.append("maxPrice", "5000");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Referer": "https://fashion-search-010.vercel.app",
        // 2026年版特有のヘッダーも念のため追加
        "x-rakuten-applicationid": APP_ID 
      },
      cache: 'no-store'
    });

    const data = await res.json();

    if (!res.ok || data.errors || data.error) {
      console.error("❌楽天API最終エラー詳細:", JSON.stringify(data));
      return NextResponse.json([]);
    }

    const items = (data.Items || []).map((item: any) => {
      const i = item.Item || item;
      return {
        title: i.itemName,
        price: i.itemPrice,
        dupe_image: i.mediumImageUrls?.[0]?.imageUrl || i.mediumImageUrls?.[0],
        link: i.itemUrl,
      };
    });

    return NextResponse.json(items);

  } catch (error) {
    console.error("❌通信エラー:", error);
    return NextResponse.json([]);
  }
}