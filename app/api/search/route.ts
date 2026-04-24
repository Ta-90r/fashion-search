import { NextResponse } from "next/server";
import products from "../../../data/products.json";

export async function POST(req: Request) {
  try {
    const { keyword } = await req.json();

    // 🔥 キーワード分割（超重要）
    const keywords = keyword
      .toLowerCase()
      .split(" ")
      .filter((k: string) => k);

    const results = products.filter((item: any) => {
      const text = `
        ${item.title}
        ${item.high_brand}
        ${item.dupe_brand}
      `.toLowerCase();

      // 👉 どれか1つでも含めばOK
      return keywords.some((k: string) => text.includes(k));
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}