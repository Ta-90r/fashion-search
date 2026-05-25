import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎀 【本命のプチプラ商品リスト】
// SHOPLISTやGRLで良さそうな服を見つけたら、ここに追加していくだけです！
const REAL_PRODUCTS = [
  {
    id: "item-001",
    title: "GRL パフスリーブ スクエアネック シャーリング ミニワンピース",
    price: 2499,
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/05/15/1684116244ea7bd169a834be2bb0bb8d73b5da74fb_thumbnail_720x.jpg", // テスト用の仮画像です。後でGRLの画像URLに変えられます
    link: "https://www.grail.bz/", // 提携されたらアフィリエイトリンクに変える場所
    description: "パフスリーブ、スクエアネック、シャーリング、フェミニン、ホワイト、白、ワンピ、上品、フレンチガーリー"
  },
  {
    id: "item-002",
    title: "SHOPLIST ツイード風 ニットベスト ＆ ミニスカート セットアップ",
    price: 3980,
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/08/21/1692584123b3f2e1bbda35e390c5fa62bdfba5ce0d_thumbnail_720x.jpg",
    link: "https://shop-list.com/", // 提携されたらアフィリエイトリンクに変える場所
    description: "ツイード、セットアップ、ミニスカート、ピンク、量産型、Darich風、可愛い、ガーリー"
  },
  
  // 💡 【新しいお洋服を増やしたい時は、ここから下にコピペして追加できます！】
  // {
  //   id: "item-003",
  //   title: "ブランド名 服の名前",
  //   price: 2990,
  //   dupe_image: "画像URL",
  //   link: "通常URL（提携後はアフィリンク）",
  //   description: "色、形、素材、系統などのキーワード"
  // },
];

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

    // OpenAIで画像とリストをマッチング
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `ユーザーがアップロードした服のスクリーンショット画像と、私たちが手元に持っている【登録商品リスト】を見比べて、デザイン、形、色、系統、雰囲気が類似している順に、上位5件の商品ID（id）と、その類似度（matchScore: 70〜99の数値）を計算して、必ず以下の純粋なJSONフォーマットだけで返しなさい。余計な説明文は一切不要です。
          
          【登録商品リスト】
          ${JSON.stringify(REAL_PRODUCTS)}
          
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
    const matchedList = JSON.parse(cleanJson).items || JSON.parse(cleanJson);

    // 配列であるかチェックしてマッピング
    const list = Array.isArray(matchedList) ? matchedList : Object.values(matchedList)[0];
    const finalResults = (Array.isArray(list) ? list : []).map((match: any) => {
      const originalProduct = REAL_PRODUCTS.find(p => p.id === match.id);
      if (!originalProduct) return null;
      return {
        ...originalProduct,
        matchScore: match.matchScore
      };
    }).filter(Boolean);

    return NextResponse.json(finalResults);
  } catch (error) {
    console.error("AI Search Error:", error);
    return NextResponse.json([]);
  }
}