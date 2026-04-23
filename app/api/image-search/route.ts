import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 仮のキーワード（AIなし）
    return NextResponse.json({
      keyword: "ワンピース GRL",
    });
  } catch (e) {
    return NextResponse.json(
      { error: "failed" },
      { status: 500 }
    );
  }
}