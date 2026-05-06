import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const keyword = body?.keyword;

    console.log("検索キーワード:", keyword);

    if (!keyword) {
      return NextResponse.json([]);
    }

    const APP_ID = process.env.RAKUTEN_APP_ID;

    if (!APP_ID) {
      console.error("APP_IDなし");
      return NextResponse.json([]);
    }

    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${APP_ID}&keyword=${encodeURIComponent(
      keyword
    )}&hits=20`;

    const res = await fetch(url);
    const data = await res.json();

    console.log("楽天API raw:", JSON.stringify(data, null, 2));

    // 🔥 完全ガード
    if (!data || !data.Items) {
      console.error("Itemsなし:", data);
      return NextResponse.json([]);
    }

    const items = [];

    for (const item of data.Items) {
      if (!item || !item.Item) continue;

      const i = item.Item;

      items.push({
        title: i.itemName || "商品名なし",
        price: i.itemPrice || 0,
        dupe_image:
          i.mediumImageUrls?.[0]?.imageUrl ||
          "https://via.placeholder.com/300",
        link: i.itemUrl || "#",
      });
    }

    console.log("変換後items:", items.length);

    return NextResponse.json(items);

  } catch (error) {
    console.error("楽天APIエラー:", error);
    return NextResponse.json([]);
  }
}