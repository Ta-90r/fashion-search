import { NextResponse } from "next/server";
import products from "../../../data/products.json";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const results = products.filter((item: any) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );

    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json([]);
  }
}