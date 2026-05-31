import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎀 商品の型定義（TypeScriptのエラーを防ぐための設計図）
interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  style: string;
  dupe_image: string;
  link: string;
  description: string;
}

// 🛍️ クローゼットの商品リスト（全データ ＋ 追加用の空枠4つ）
const REAL_PRODUCTS: Product[] = [
  {
    id: "item-001",
    title: "[GRL] パフスリーブ スクエアネック シャーリングワンピ",
    price: 2499,
    category: "ワンピース",
    style: "フェミニン",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/05/15/1684116244ea7bd169a834be2bb0bb8d73b5da74fb_thumbnail_720x.jpg", 
    link: "https://www.grail.bz/item/ru14861119/",
    description: "パフスリーブ、スクエアネック、シャーリング、フェミニン、ホワイト、白、ワンピ、きれいめ、甘め、お嬢様風"
  },
  {
    id: "item-002",
    title: "[SHOPLIST] ツイード調 ミニスカート セットアップスーツ",
    price: 3980,
    category: "ボトムス",
    style: "大人ギャル",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/08/21/1692584123b3f2e1bbda35e390c5fa62bdfba5ce0d_thumbnail_720x.jpg",
    link: "https://shop-list.com/",
    description: "ツイード、セットアップ、ミニスカート、ピンク、量産型、地雷系、フレンチガーリー、可愛い"
  },
  {
    id: "item-003",
    title: "[SHEIN] オープンショルダー リブニット タイトワンピ",
    price: 2190,
    category: "ワンピース",
    style: "大人ギャル",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/06/02/1685672153a3b0b5bd8f3b2a2b3b4c5d6e7f8g9h0_thumbnail_720x.jpg",
    link: "https://jp.shein.com/",
    description: "肩出し、オープンショルダー、タイトワンピース、ブラック、黒、リブニット、あざとい、セクシー"
  },
  {
    id: "item-004",
    title: "[GRL] ツイード調 ミニスカート セットアップ カーディガン",
    price: 1299,
    category: "ボトムス",
    style: "大人ギャル",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/08/21/1692584123b3f2e1bbda35e390c5fa62bdfba5ce0d_thumbnail_720x.jpg",
    link: "https://www.grail.bz/item/sm2461112/?s=2",
    description: "ツイード、セットアップ、ミニスカート、ピンク、量産型、地雷系、フレンチガーリー、可愛い"
  },
  {
    id: "item-005",
    title: "[SHOPLIST] オフショルダー ミニワンピ ティアード",
    price: 3980,
    category: "ワンピース",
    style: "フェミニン",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/08/21/1692584123b3f2e1bbda35e390c5fa62bdfba5ce0d_thumbnail_720x.jpg",
    link: "https://shop-list.com/women/miniministore/6GUJI-001/",
    description: "オフショルダー、ミニワンピ、ティアード、フレンチガーリー、可愛い、フレアワンピース"
  },
  {
    id: "item-006",
    title: "[SHOPLIST] ハイウエスト ミニスカート フレアミニスカート スタイルアップ",
    price: 3980,
    category: "ボトムス",
    style: "きれいめ",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/08/21/1692584123b3f2e1bbda35e390c5fa62bdfba5ce0d_thumbnail_720x.jpg",
    link: "https://shop-list.com/women/aimoha/JSrhf1598a/",
    description: "ハイウエスト、ミニスカート、フレアミニスカート、スタイルアップ、美シルエット、細見え、ガーリー"
  },
  {
    id: "item-007",
    title: "[SHOPLIST] 秋 新作 フェイクレザー ラップ風スカート ペチパンツ付き",
    price: 3980,
    category: "ボトムス",
    style: "きれいめ",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/08/21/1692584123b3f2e1bbda35e390c5fa62bdfba5ce0d_thumbnail_720x.jpg",
    link: "https://shop-list.com/women/hera-witch/sk-13411/",
    description: "秋、フェイクレザー、ラップ風スカート、ペチパンツ付き、黒、白、ブラウン、レザー、美シルエット、脚長効果"
  },
  {
    id: "item-008",
    title: "[SHOPLIST] デコルテオープン ニットワンピース セットアップ ワンピースセットアップ 2WAY",
    price: 3980,
    category: "ワンピース",
    style: "カジュアル",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/08/21/1692584123b3f2e1bbda35e390c5fa62bdfba5ce0d_thumbnail_720x.jpg",
    link: "https://shop-list.com/women/aimoha/ygd3273a/",
    description: "韓国ファッション、ワンピース、秋服、ロンT、ハーフジップ、セクシーランジェリー、オフィスカジュアル、ジャンパースカート、厚底スニーカー、ニットベスト、スウェット、冬服、ファーベスト、コート"
  },
  {
    id: "item-009",
    title: "[SHEIN] ブラウス シフォンブラウス トップス",
    price: 914,
    category: "トップス",
    style: "きれいめ",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2024/07/03/82/17199854365ea793eadd92bb64ee37befa1bf9ab7e_thumbnail_900x.webp",
    link: "https://h.accesstrade.net/sp/cc?rk=0100px8200osu1&url=https%3A%2F%2Fwww.anrdoezrs.net%2Fclick-%7BCJ_PID%7D-15889948%3Furl%3Dhttps%253A%252F%252Fjp.shein.com%252FModelyn-Ladies-Solid-Color-Ribbon-Collar-Elegant-Mesh-Splice-Chiffon-Blouse-p-37969945.html%253Fsrc_identifier%253Dst%25253D2%252560sc%25253D%2525E3%252583%252596%2525E3%252583%2525A9%2525E3%252582%2525A6%2525E3%252582%2525B9%252560sr%25253D0%252560ps%25253D1%2526src_module%253Dsearch%2526src_tab_page_id%253Dpage_search1779858494549%2526mallCode%253D1%2526pageListType%253D4%2526detailBusinessFrom%253D0-1_37969945%25257C0-2%2526imgRatio%253D3-4%2526detailBusinessFrom%253D0-1_37969945%25257C0-2%2526pageListType%253D4",
    description: "メッシュ、無地、ブラウス、シフォンブラウス、トップス、ホワイト、白、エレガント"
  },
  {
    id: "item-010",
    title: "[SHEIN] ブラウス 半袖 オフィスカジュアル",
    price: 3980,
    category: "トップス",
    style: "きれいめ",
    dupe_image: "https://img.ltwebstatic.com/v4/j/pi/2025/06/06/9d/17491957241fbc07115c8cf2aeb630d40b08ecdb2b_thumbnail_900x.webp",
    link: "https://h.accesstrade.net/sp/cc?rk=0100px8200osu1&url=https%3A%2F%2Fwww.anrdoezrs.net%2Fclick-%7BCJ_PID%7D-15889948%3Furl%3Dhttps%253A%252F%252Fjp.shein.com%252FDAZY-Cold-Shoulder-Keyhole-Back-Blouse-p-19488531.html%253Fsrc_identifier%253Dst%25253D2%252560sc%25253D%2525E3%252583%252596%2525E3%252583%2525A9%2525E3%252582%2525A6%2525E3%252582%2525B9%252560sr%25253D0%252560ps%25253D1%2526src_module%253Dsearch%2526src_tab_page_id%253Dpage_search1779858494549%2526mallCode%253D1%2526pageListType%253D4%2526detailBusinessFrom%253D0-1_19488531%25257C0-2%2526imgRatio%253D3-4%2526detailBusinessFrom%253D0-1_19488531%25257C0-2%2526pageListType%253D4",
    description: "ブラウス、オフィスカジュアル、半袖、レディース、トップス、半袖トップス、ブラウストップス、オフィス"
  },
  {
    id: "item-011",
    title: "[SHEIN] ノースリーブ ホルターネック タンクトップ & フリルヘム ミニスカート 2点セット レディース、夏 エレガント",
    price: 2529,
    category: "ワンピース",
    style: "フェミニン",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/05/15/1684116244ea7bd169a834be2bb0bb8d73b5da74fb_thumbnail_720x.jpg",
    link: "https://h.accesstrade.net/sp/cc?rk=0100px8200osu1&url=https%3A%2F%2Fwww.anrdoezrs.net%2Fclick-%7BCJ_PID%7D-15889948%3Furl%3Dhttps%253A%252F%252Fjp.shein.com%252FSleeveless-Halter-Neck-Tank-Top-Ruffle-Hem-Mini-Skirt-2-Pieces-Set-For-Women-Summer-Elegant-p-162801697.html%253Fsrc_identifier%253Dst%25253D2%252560sc%25253D%2525E3%252582%2525BB%2525E3%252583%252583%2525E3%252583%252588%2525E3%252583%252589%2525E3%252583%2525AC%2525E3%252582%2525B9%252560sr%25253D0%252560ps%25253D1%2526src_module%253Dsearch%2526src_tab_page_id%253Dpage_goods_detail1779859371286%2526mallCode%253D1%2526pageListType%253D4%2526detailBusinessFrom%253D0-1_145022950%25257C0-2%2526imgRatio%253D3-4%2526detailBusinessFrom%253D0-1_145022950%25257C0-2%2526pageListType%253D4%2526main_attr%253D27_89235171",
    description: "ノースリーブ、ホルターネック、タンクトップ、ミニスカート、2点セット、レディース、夏、エレガント"
  },
  {
    id: "item-012",
    title: "[GRL] フリルニットワンピース",
    price: 3980,
    category: "ワンピース",
    style: "フェミニン",
    dupe_image: "https://www.grail.bz/img/ru16881119.jpg",
    link: "https://www.grail.bz/item/ru16881119/",
    description: "フリル タイトシルエット"
  },
  {
    id: "item-013",
    title: "[SHOPLIST] オフショルニットワンピ",
    price: 3980,
    category: "ワンピース",
    style: "大人ギャル",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/06/02/1685672153a3b0b5bd8f3b2a2b3b4c5d6e7f8g9h0_thumbnail_720x.jpg",
    link: "https://shop-list.com/women/",
    description: "韓国ガーリー、セットアップ、ミニスカート、おとなっぽ、清楚、ミニワンピ、オフショルダー"
  },
  {
    id: "item-014",
    title: "[GRL] リボンショルダーニットワンピ",
    price: 3980,
    category: "ワンピース",
    style: "フェミニン",
    dupe_image: "https://www.grail.bz/img/mb16021112.jpg",
    link: "https://www.grail.bz/item/mb16021112/",
    description: "肩リボン、リボン、細身ニット、ニットトップス、ニットワンピ、可愛い"
  },
  {
    id: "item-015",
    title: "[GRL] オフショルニットワンピース",
    price: 3980,
    category: "ワンピース",
    style: "大人ギャル",
    dupe_image: "https://www.grail.bz/img/at26081113.jpg",
    link: "https://www.grail.bz/item/at26081113/",
    description: "オフショル、タイト感、タイトニット、ニットワンピース、オフショルニット"
  },
  {
    id: "item-016",
    title: "[GRL] 韓国風ニットミニワンピ",
    price: 3980,
    category: "ワンピース",
    style: "大人ギャル",
    dupe_image: "https://www.grail.bz/img/ru18662819.jpg",
    link: "https://www.grail.bz/item/ru18662819/",
    description: "タイトニット、韓国ガーリー、韓国風、ニットミニワンピ、ニットワンピ、ミニワンピ"
  },
  {
    id: "item-017",
    title: "[SHOPLIST] 韓国セットアップ レディース",
    price: 3980,
    category: "ボトムス",
    style: "きれいめ",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/08/21/1692584123b3f2e1bbda35e390c5fa62bdfba5ce0d_thumbnail_720x.jpg",
    link: "https://shop-list.com/women/",
    description: "韓国風、セットアップ、オフィスカジュアル、おとなっぽ"
  },
  {
    id: "item-018",
    title: "[GRL] 韓国風ニットセットアップ",
    price: 3980,
    category: "ボトムス",
    style: "カジュアル",
    dupe_image: "https://www.grail.bz/img/fu1831119.jpg",
    link: "https://www.grail.bz/item/fu1831119/",
    description: "韓国風、セットアップ、韓国セットアップ、カジュアルニット、ニットセットアップ"
  },
  {
    id: "item-026",
    title: "[GRL] アメスリフレアロングワンピース",
    price: 3980,
    category: "ワンピース",
    style: "フェミニン",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/05/15/1684116244ea7bd169a834be2bb0bb8d73b5da74fb_thumbnail_720x.jpg",
    link: "https://www.grail.bz/item/ru16061119/?s=2",
    description: "水色、ワンピース、ロングワンピース、清楚、水色ワンピース、フレアワンピース、リボン、フレンチガーリー、可愛い"
  },

  // 📝 🔽 こっから自由に商品を追加してください！（テンプレート枠を4つ用意しました）
  {
    id: "item-027",
    title: "[追加枠1] ここにタイトルをいれてね",
    price: 2990,
    category: "ワンピース", // ワンピース, トップス, ボトムス, アウター
    style: "フェミニン",     // フェミニン, 大人ギャル, きれいめ, カジュアル
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/05/15/1684116244ea7bd169a834be2bb0bb8d73b5da74fb_thumbnail_720x.jpg",
    link: "https://www.grail.bz/",
    description: "検索用キーワード、タグ"
  },
  {
    id: "item-028",
    title: "[追加枠2] ここにタイトルをいれてね",
    price: 1990,
    category: "トップス",
    style: "きれいめ",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/05/15/1684116244ea7bd169a834be2bb0bb8d73b5da74fb_thumbnail_720x.jpg",
    link: "https://www.grail.bz/",
    description: "検索用キーワード、タグ"
  },
  {
    id: "item-029",
    title: "[追加枠3] ここにタイトルをいれてね",
    price: 3490,
    category: "ボトムス",
    style: "大人ギャル",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/05/15/1684116244ea7bd169a834be2bb0bb8d73b5da74fb_thumbnail_720x.jpg",
    link: "https://www.grail.bz/",
    description: "検索用キーワード、タグ"
  },
  {
    id: "item-030",
    title: "[追加枠4] ここにタイトルをいれてね",
    price: 4990,
    category: "アウター",
    style: "カジュアル",
    dupe_image: "https://img.ltwebstatic.com/images3_pi/2023/05/15/1684116244ea7bd169a834be2bb0bb8d73b5da74fb_thumbnail_720x.jpg",
    link: "https://www.grail.bz/",
    description: "検索用キーワード、タグ"
  }
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const requestedCategory = formData.get("category") as string;
    const requestedStyle = formData.get("styleTone") as string;

    // 💡 カタログ検索モード（スクショ画像がない場合の処理）
    if (!file || file.size === 0) {
      let filteredProducts = REAL_PRODUCTS;

      if (requestedCategory) {
        filteredProducts = filteredProducts.filter(p => p.category === requestedCategory);
      }
      if (requestedStyle) {
        filteredProducts = filteredProducts.filter(p => p.style === requestedStyle);
      }

      const catalogResults = filteredProducts.map(p => ({ ...p, matchScore: 100 }));
      return NextResponse.json(catalogResults);
    }

    // 📸 スクショがある場合（AI画像解析モード）
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // 事前に指定条件で絞り込む
    let allowedProducts = REAL_PRODUCTS;
    if (requestedCategory) allowedProducts = allowedProducts.filter(p => p.category === requestedCategory);
    if (requestedStyle) allowedProducts = allowedProducts.filter(p => p.style === requestedStyle);

    if (allowedProducts.length === 0) {
      return NextResponse.json([]);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `ユーザーがアップロードした服の画像と、指定条件に絞り込まれた【登録商品リスト】を見比べて、デザインや雰囲気が類似している順に、上位5件の商品ID（id）と類似度（matchScore: 70〜99の数値）を算出してください。
          必ずJSONフォーマット（配列形式）のみで返却し、余計な文章は一切出力しないでください。

          【登録商品リスト】
          ${JSON.stringify(allowedProducts)}
          
          【返却するJSONフォーマット】
          [
            {"id": "item-001", "matchScore": 95}
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
    
    // 🛠️ エラー回避：正規表現を使わず、安全な replaceAll でマークダウンの装飾を除去
    const cleanJson = aiResultText.replaceAll("```json", "").replaceAll("```", "").trim();
    const matchedList = JSON.parse(cleanJson);

    const itemsArray = Array.isArray(matchedList) ? matchedList : Object.values(matchedList)[0];
    
    // 🛠️ エラー回避：型を Product | undefined に制限せず、見つかったものだけを確実に配列に展開
    const finalResults: Product[] = [];
    
    if (Array.isArray(itemsArray)) {
      for (const match of itemsArray) {
        const originalProduct = allowedProducts.find(p => p.id === match.id);
        if (originalProduct) {
          finalResults.push({
            ...originalProduct,
            ...{ matchScore: match.matchScore || 85 } // 類似度スコアを一時的に結合
          });
        }
      }
    }

    return NextResponse.json(finalResults);
  } catch (error) {
    console.error("AI Search Error:", error);
    return NextResponse.json([]);
  }
}