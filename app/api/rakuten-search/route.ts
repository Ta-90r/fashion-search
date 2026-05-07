import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keyword = body?.keyword;

    console.log("検索キーワード:", keyword);

    if (!keyword) {
      return NextResponse.json([]);
    }

    // 🔥 楽天ID取得
    const APP_ID = process.env.RAKUTEN_APP_ID;

    console.log("APP_ID確認:", APP_ID);

    if (!APP_ID) {
      console.error("APP_IDなし");
      return NextResponse.json([]);
    }

    // 🔥 URLを安全に生成
    const params = new URLSearchParams({
      applicationId: APP_ID,
      keyword: keyword,
      hits: "20",
    });

    const url =
      "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?" +
      params.toString();

    console.log("最終URL:", url);

    const res = await fetch(url);

    console.log("HTTP Status:", res.status);

    const data = await res.json();

    console.log("楽天API raw:", JSON.stringify(data, null, 2));

    // 🔥 エラー返却
    if (data.error) {
      console.error("楽天エラー:", data.error_description);
      return NextResponse.json([]);
    }

    // 🔥 Items防御
    if (!data.Items || !Array.isArray(data.Items)) {
      console.error("Itemsなし");
      return NextResponse.json([]);
    }

    const items = data.Items.map((item: any) => {
      const i = item.Item;

      return {
        title: i.itemName || "商品名なし",
        price: i.itemPrice || 0,
        dupe_image:
          i.mediumImageUrls?.[0]?.imageUrl ||
          "https://via.placeholder.com/300",
        link: i.itemUrl || "#",
      };
    });

    console.log("取得件数:", items.length);

    return NextResponse.json(items);

  } catch (error) {
    console.error("楽天APIエラー:", error);

    return NextResponse.json([]);
  }
}