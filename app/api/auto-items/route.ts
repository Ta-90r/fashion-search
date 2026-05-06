console.log("🔥 API通過した");
console.log("APP ID:", process.env.RAKUTEN_APP_ID);
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appId = process.env.RAKUTEN_APP_ID;
    const affId = process.env.RAKUTEN_AFF_ID;

    console.log("APP ID:", appId);

    const keyword = "ワンピース";

    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${appId}&keyword=${encodeURIComponent(
      keyword
    )}&affiliateId=${affId}`;

    const res = await fetch(url);

    const data = await res.json();

    console.log("楽天結果:", data);

    if (!data.Items) {
      return NextResponse.json([]);
    }

    const items = data.Items.map((item: any) => ({
      name: item.Item.itemName,
      image: item.Item.mediumImageUrls[0].imageUrl,
      link: item.Item.affiliateUrl,
      price: item.Item.itemPrice,
    }));

    return NextResponse.json(items);

  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json([]);
  }
}