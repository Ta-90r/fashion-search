import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // ファイルがない場合はデフォルトキーワード
    if (!file) {
      return NextResponse.json({ keyword: "ファッション 人気 レディース" });
    }

    const fileName = file.name.toLowerCase();
    let tags: string[] = [];

    // ファイル名に基づいた簡易キーワード判定
    if (fileName.includes("white")) tags.push("白");
    if (fileName.includes("black")) tags.push("黒");
    if (fileName.includes("knit")) tags.push("ニット");
    if (fileName.includes("onepiece")) tags.push("ワンピース");
    if (fileName.includes("pink")) tags.push("ピンク");
    if (fileName.includes("blue")) tags.push("青");

    // 何もヒットしない、または基本タグとして追加
    if (tags.length === 0) {
      tags.push("レディース", "ファッション");
    } else {
      tags.push("レディース");
    }

    return NextResponse.json({
      keyword: tags.join(" "),
    });

  } catch (error) {
    console.error("image-search error:", error);
    return NextResponse.json({ keyword: "レディース ファッション" });
  }
}