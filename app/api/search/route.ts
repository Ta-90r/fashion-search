import { NextResponse } from "next/server";

// 👇 ここ重要（相対パスにする）
import products from "../../../data/products.json";

export async function POST(req: Request) {
  try {
    const { keyword } = await req.json();

    const results = products.filter((item: any) =>
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.high_brand.toLowerCase().includes(keyword.toLowerCase()) ||
      item.dupe_brand.toLowerCase().includes(keyword.toLowerCase())
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}