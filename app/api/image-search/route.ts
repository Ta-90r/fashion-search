import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("image-search API 呼ばれた");

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("fileなし");

      return NextResponse.json({
        keyword: "人気",
      });
    }

    console.log("fileあり:", file.name);

    return NextResponse.json({
      keyword: "白 ワンピース 韓国 ガーリー",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      keyword: "人気",
    });
  }
}