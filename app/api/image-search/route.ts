import { NextResponse } from "next/server";
import products from "../../../data/products.json";

export async function POST() {
  return NextResponse.json(products);
}