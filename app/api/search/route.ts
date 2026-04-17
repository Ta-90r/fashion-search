import { NextResponse } from "next/server";
import products from "../../../data/products.json";

export async function POST(req: Request) {
  const body = await req.json();
  const keyword = body.keyword || "";

  const results = products.filter((item) =>
    item.title.toLowerCase().includes(keyword.toLowerCase()) ||
    item.high_brand.toLowerCase().includes(keyword.toLowerCase()) ||
    item.dupe_brand.toLowerCase().includes(keyword.toLowerCase())
  );

  return NextResponse.json(results);
}