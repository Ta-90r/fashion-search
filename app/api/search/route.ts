import { NextResponse } from "next/server";
import products from "../../../data/products.json";

export async function POST(req: Request) {
  try {
    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json(products);
    }

    const keywords = keyword
      .toLowerCase()
      .split(" ")
      .filter((k: string) => k);

    const results = products.filter((item: any) => {
      const tagsText = (item.tags || []).join(" ").toLowerCase();

      const text = `
        ${item.title || ""}
        ${item.high_brand || ""}
        ${item.dupe_brand || ""}
        ${tagsText}
      `.toLowerCase();

      return keywords.some((k: string) => text.includes(k));
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("search error:", error);
    return NextResponse.json([], { status: 500 });
  }
}