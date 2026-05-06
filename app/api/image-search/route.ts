import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({
        keyword: "白 ニット レディース",
      });
      
    }

    const fileName = file.name.toLowerCase();

    let tags: string[] = [];

    // ▼ ファイル名から仮タグ生成（AIなし版）
    if (fileName.includes("white")) {
      tags.push("白,トップス,レディース");
    }

    if (fileName.includes("black")) {
      tags.push("黒");
    }

    if (fileName.includes("onepiece")) {
      tags.push("ワンピース");
    }

    if (fileName.includes("setup")) {
      tags.push("セットアップ");
    }

    if (fileName.includes("girly")) {
      tags.push("ガーリー");
    }

    if (fileName.includes("korea")) {
      tags.push("韓国");
    }

    if (fileName.includes("casual")) {
      tags.push("カジュアル");
    }

    if (fileName.includes("pink")) {
      tags.push("ピンク");
    }

    if (fileName.includes("beige")) {
      tags.push("ベージュ");
    }

    // ▼ 何も判定できなかった場合
    if (tags.length === 0) {
      tags = ["人気"];
    }

    return NextResponse.json({
      keyword: tags.join(" "),
    });
  } catch (error) {
    console.error("image-search error:", error);

    return NextResponse.json({
      keyword: "人気",
    });
  }
}