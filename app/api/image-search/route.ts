import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎀 【万能クローゼット：メインのGRL・SHOPLIST・SHEINアイテム部屋】
// あなたが各ショップで見つけた「可愛いプチプラ服」をここにどんどん追加していけます！
const REAL_PRODUCTS = [
  {
    id: "item-001",
    title: "[GRL] パフスリーブ スクエアネック シャーリングワンピ",
    price: 2499,
    // 💡 テスト用画像（表示確認用）。GRLの商品画像URLに差し替え可能です。
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/05/15/1684116244ea7bd169a834be2bb0bb8d73b5da74fb_thumbnail_720x.jpg", 
    link: "https://www.grail.bz/", // 通常URL、またはアフィリエイトリンク
    description: "パフスリーブ、スクエアネック、シャーリング、フェミニン、ホワイト、白、ワンピ、きれいめ、甘め、お嬢様風"
  },
  {
    id: "item-002",
    title: "[SHOPLIST] ツイード調 ミニスカート セットアップスーツ",
    price: 3980,
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/08/21/1692584123b3f2e1bbda35e390c5fa62bdfba5ce0d_thumbnail_720x.jpg",
    link: "https://shop-list.com/", // 通常URL、またはアフィリエイトリンク
    description: "ツイード、セットアップ、ミニスカート、ピンク、量産型、地雷系、フレンチガーリー、可愛い"
  },
  {
    id: "item-003",
    title: "[SHEIN] オープンショルダー リブニット タイトワンピ",
    price: 2190,
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/06/02/1685672153a3b0b5bd8f3b2a2b3b4c5d6e7f8g9h0_thumbnail_720x.jpg",
    link: "https://jp.shein.com/", // アクセストレードで発行したリンク
    description: "肩出し、オープンショルダー、タイトワンピース、ブラック、黒、リブニット、あざとい、セクシー"
  }
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

    // OpenAIで画像とリストを完璧にマッチング
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `ユーザーがアップロードした服の画像と、手元にある【登録商品リスト】を客観的に見比べて、デザイン、形、色、系統、雰囲気が類似している順に、上位5件の商品ID（id）と類似度（matchScore: 70〜99の数値）を算出してください。
          必ず「返却するJSONフォーマット」のルールのみに従い、余計な日本語の文章や \`\`\`json のような囲み文字は一切出力しないでください。

          【登録商品リスト】
          ${JSON.stringify(REAL_PRODUCTS)}
          
          【返却するJSONフォーマット】
          [
            {"id": "item-001", "matchScore": 95},
            {"id": "item-002", "matchScore": 82}
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
    });

    const aiResultText = response.choices[0].message.content || "[]";
    
    // AIの返答からノイズを完全に除去してパース
    const cleanJson = aiResultText.replace(/```json|```/g, "").trim();
    const matchedList = JSON.parse(cleanJson);

    // AIが選んだIDに商品詳細をマッピング
    const itemsArray = Array.isArray(matchedList) ? matchedList : Object.values(matchedList)[0];
    const finalResults = (Array.isArray(itemsArray) ? itemsArray : []).map((match: any) => {
      const originalProduct = REAL_PRODUCTS.find(p => p.id === match.id);
      if (!originalProduct) return null;
      return {
        ...originalProduct,
        matchScore: match.matchScore || 85
      };
    }).filter(Boolean);

    return NextResponse.json(finalResults);
  } catch (error) {
    console.error("AI Search Error:", error);
    return NextResponse.json([]);
  }
}