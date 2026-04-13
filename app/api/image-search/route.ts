import { NextResponse } from "next/server";
import products from "../../../data/products.json";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = body.query || "";

    const filtered = products.filter((item: any) =>
      item.title.includes(query)
    );

    return NextResponse.json(filtered);
  } catch (e) {
    return NextResponse.json([]);
  }
}