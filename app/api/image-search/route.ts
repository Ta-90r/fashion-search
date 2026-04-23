import { NextResponse } from "next/server";

export async function POST() {
  // 仮タグ
  return NextResponse.json({
    keyword: "ワンピース 白 韓国"
  });
}