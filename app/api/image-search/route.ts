import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✨ 【ここにSHEINのsnidel/Darich風アイテムを好きなだけ追加していけます！】
const SHEIN_PRODUCTS = [
  {
    id: "shein-001",
    title: "DAZY フェミニン パフスリーブ スクエアネック ワンピース (snidel風)",
    price: 2850,
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/05/15/1684116244ea7bd169a834be2bb0bb8d73b5da74fb_thumbnail_720x.jpg", // SHEINの画像URLを入れてね
    link: "https://jp.shein.com/", // あなたのSHEINアフィリエイトリンク、または商品URLを入れてね
    description: "パフスリーブ、スクエアネック、シャーリング、フェミニン、モテ服、白、ワンピ"
  },
  {
    id: "shein-002",
    title: "ツイード ニット ベスト ＋ ミニスカート セットアップ (Darich風)",
    price: 3420,
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/08/21/1692584123b3f2e1bbda35e390c5fa62bdfba5ce0d_thumbnail_720x.jpg",
    link: "https://jp.shein.com/",
    description: "ツイード、セットアップ、ミニスカート、量産型、フレンチガーリー、ピンク、Darich風、上品"
  },
  {
    id: "shein-003",
    title: "オープンショルダー ニット タイトワンピース (あざと可愛い系)",
    price: 2190,
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/06/02/1685672153a3b0b5bd8f3b2a2b3b4c5d6e7f8g9h0_thumbnail_720x.jpg",
    link: "https://jp.shein.com/",
    description: "肩出し、オープンショルダー、タイトワンピース、大人っぽい、黒、ニットワンピ"
  }
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "画像がありません" }, { status: 400 });
    }

    // 1. 画像をAIが読めるBase64形式に変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // 2. OpenAIのVison APIを呼び出し、登録されたSHEIN商品の中から「激似」を選ぶ
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // コストが安くて超高精度なモデル
      messages: [
        {
          role: "system",
          content: `ユーザーがアップロードした服のスクリーンショット（snidelやDarichなど）と、私たちが手元に持っている【SHEINの商品リスト】を見比べて、デザイン、形、色、雰囲気が似ている順に、上位5件の商品IDと、その類似度（matchScore: 70〜99の数値）を計算して、必ず以下の純粋なJSONフォーマットだけで返しなさい。余計な説明文は一切不要。
          
          【SHEINの商品リスト】
          ${JSON.stringify(SHEIN_PRODUCTS)}
          
          【返却するJSONフォーマット（例）】
          [
            {"id": "shein-002", "matchScore": 95},
            {"id": "shein-001", "matchScore": 82}
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
      response_format: { type: "json_object" }, // JSONで返させる
    });

    const aiResultText = response.choices[0].message.content || "[]";
    // OpenAIがマークダウンのコードブロックで返してきた場合を考慮してクレンジング
    const cleanJson = aiResultText.replace(/```json|```/g, "").trim();
    const matchedList = JSON.parse(cleanJson);

    // 3. AIが選んだIDに、商品の詳細データ（画像やリンク）を紐付けてフロントに返す
    const finalResults = matchedList.map((match: any) => {
      const originalProduct = SHEIN_PRODUCTS.find(p => p.id === match.id);
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