import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();
    // VercelからIDを取得。念のため完全にクリーンな状態にします
    const APP_ID = process.env.RAKUTEN_APP_ID?.replace(/\s/g, "");

    if (!APP_ID) {
      console.error("RAKUTEN_APP_IDが見つかりません。Vercelの設定を確認してください。");
      return NextResponse.json([]);
    }

    if (!keyword) return NextResponse.json([]);

    // 1. URLを構築（?の直後に必ずapplicationIdが来るようにします）
    // 2026年最新ドメインに固定します
    const baseUrl = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
    const params = new URLSearchParams();
    params.append("applicationId", APP_ID);
    params.append("keyword", keyword);
    params.append("hits", "10");
    params.append("formatVersion", "2");

    const finalUrl = `${baseUrl}?${params.toString()}`;

    // 2. Fetch実行
    const res = await fetch(finalUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        // 最後に / を入れない、楽天デベロッパー登録ドメイン
        "Referer": "https://fashion-search-010.vercel.app"
      },
      cache: "no-store"
    });

    const data = await res.json();

    // 3. エラー時の詳細ログ
    if (!res.ok || data.errors) {
      console.error("❌楽天APIエラー詳細:", JSON.stringify(data));
      return NextResponse.json([]);
    }

    // 4. データ整形
    const items = (data.Items || []).map((item: any) => {
      // formatVersion: 2 の場合、階層が深くないので直接取得
      const i = item.Item || item;
      return {
        title: i.itemName,
        price: i.itemPrice,
        dupe_image: i.mediumImageUrls?.[0]?.imageUrl || i.mediumImageUrls?.[0],
        link: i.itemUrl,
      };
    });

    return NextResponse.json(items);

  } catch (error: any) {
    console.error("❌サーバー内部エラー:", error.message);
    return NextResponse.json([]);
  }
}