import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PRODUCTS } from "./products"; // さきほど作成した保管庫からデータを読み込む

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "画像がありません" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // OpenAIの画像解析
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `ユーザーがアップロードしたコーディネートや服のスクリーンショット画像と、私たちが手元に持っている【登録商品リスト】を見比べて、デザイン、形、色、系統、シルエット、雰囲気が類似している順に、上位5件の商品ID（id）と、その類似度（matchScore: 70〜99の数値）を計算して、必ず以下の純粋なJSONフォーマットだけで返しなさい。余記の説明文は一切不要です。
          
          【登録商品リスト】
          ${JSON.stringify(SYSTEM_PRODUCTS)}
          
          【返却するJSONフォーマット】
          [
            {"id": "item-xxx", "matchScore": 95},
            {"id": "item-yyy", "matchScore": 82}
          ]`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const aiResultText = response.choices[0].message.content || "[]";
    const cleanJson = aiResultText.replace(/```json|```/g, "").trim();
    const matchedList = JSON.parse(cleanJson);

    // AIが選んだ結果に商品データを紐付け
    const finalResults = matchedList.map((match: any) => {
      const originalProduct = SYSTEM_PRODUCTS.find(p => p.id === match.id);
      if (!originalProduct) return null;
      return {
        ...originalProduct,
        matchScore: match.matchScore
      };
    }).filter(Boolean);

    return NextResponse.json(finalResults);
  } catch (error) {
    console.error("AI Search Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}