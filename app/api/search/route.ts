import { NextRequest, NextResponse } from "next/server";
import products from "../../../data/products.json";

type Product = {
  title: string;
  high_brand: string;
  high_image: string;
  dupe_brand: string;
  dupe_image: string;
  link: string;
  price: number;
  tags: string[]; // ←これが重要
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const keyword = body.keyword?.toLowerCase() || "";

  const results = (products as Product[]).filter((item) => {
    const text =
      item.title +
      item.high_brand +
      item.dupe_brand +
      item.tags.join(" ");

    return text.toLowerCase().includes(keyword);
  });

  return NextResponse.json(results);
}