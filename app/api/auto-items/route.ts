import { NextResponse } from "next/server";

export async function GET() {
  try {
    const APP_ID = process.env.RAKUTEN_APP_ID;
    const url = `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401?applicationId=${APP_ID}&keyword=${encodeURIComponent("レディース ファッション 人気")}&hits=10`;

    const res = await fetch(url, {
      headers: { "Referer": "https://fashion-search-010.vercel.app" }
    });
    const data = await res.json();

    const items = data.Items?.map((item: any) => ({
      title: item.Item.itemName,
      price: item.Item.itemPrice,
      dupe_image: item.Item.mediumImageUrls?.[0]?.imageUrl,
      link: item.Item.itemUrl,
    })) || [];

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json([]);
  }
}