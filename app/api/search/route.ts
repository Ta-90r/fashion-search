import { NextResponse } from "next/server";
import products from "@/data/products.json";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const keyword = body.keyword || "";

    const results = products.filter((item: any) =>
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      item.high_brand.toLowerCase().includes(keyword.toLowerCase()) ||
      item.dupe_brand.toLowerCase().includes(keyword.toLowerCase())
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("search error:", error);

    // ❗絶対にJSON返す
    return NextResponse.json(
      { error: "search failed" },
      { status: 500 }
    );
  }
}