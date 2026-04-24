import { NextResponse } from "next/server";
import products from "../../../data/products.json";

export async function POST(req: Request) {
  try {
    const { keyword } = await req.json();

    // 空検索なら全部返す
    if (!keyword) {
      return NextResponse.json(products);
    }

    const keywords = keyword
      .toLowerCase()
      .split(" ")
      .filter((k: string) => k);

    const results = products.filter((item: any) => {
      // 🔥 null対策（これが超重要）
      const text = `
        ${item.title || ""}
        ${item.high_brand || ""}
        ${item.dupe_brand || ""}
      `.toLowerCase();

      return keywords.some((k: string) => text.includes(k));
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("search error:", error);
    return NextResponse.json([], { status: 500 });
  }
}