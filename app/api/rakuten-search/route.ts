import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json([]);
    }

    const appId = process.env.RAKUTEN_APP_ID;

    const url =
      `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601` +
      `?applicationId=${appId}` +
      `&keyword=${encodeURIComponent(keyword)}` +
      `&hits=12`;

    const res = await fetch(url);
    const data = await res.json();

    const items = data.Items.map((item: any) => ({
      title: item.Item.itemName,
      dupe_brand: item.Item.shopName,
      dupe_image: item.Item.mediumImageUrls?.[0]?.imageUrl || "",
      price: item.Item.itemPrice,
      link: item.Item.itemUrl,
      high_brand: "LookMatch 추천",
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("楽天APIエラー:", error);
    return NextResponse.json([]);
  }
}