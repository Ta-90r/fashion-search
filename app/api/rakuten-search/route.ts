import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    // 1. キーワードチェック
    if (!keyword) {
      console.log("キーワードが空です");
      return NextResponse.json([]);
    }

    // 2. 環境変数の取得（英数字混じりのIDでOK）
    const APP_ID = process.env.RAKUTEN_APP_ID;
    
    if (!APP_ID) {
      console.error("APP_IDが環境変数に設定されていません");
      return NextResponse.json({ error: "環境変数未設定" }, { status: 500 });
    }

    // 3. 【重要】2026年最新のドメインとエンドポイントに修正
    // 旧: app.rakuten.co.jp -> 新: openapi.rakuten.co.jp
    const url = new URL("https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401");
    url.searchParams.append("applicationId", APP_ID);
    url.searchParams.append("keyword", keyword);
    url.searchParams.append("hits", "20");

    console.log("リクエスト送信先:", url.toString());

    // 4. APIリクエスト（Refererヘッダーが必須になる場合があります）
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        // 自分のアプリURLを伝えることで認証を通しやすくします
        "Referer": "https://fashion-search-010.vercel.app/",
      },
    });

    const data = await res.json();

    // 5. 楽天からのエラー応答を詳細にログ出力
    if (!res.ok || data.error) {
      console.error("楽天APIエラー詳細:", data);
      return NextResponse.json({ 
        error: data.error_description || "楽天API側でエラーが発生しました" 
      }, { status: res.status });
    }

    // 6. データの整形
    if (!data.Items || !Array.isArray(data.Items)) {
      return NextResponse.json([]);
    }

    const items = data.Items.map((item: any) => {
      const i = item.Item;
      return {
        title: i.itemName || "商品名なし",
        price: i.itemPrice || 0,
        // 画像URLの取得先も最新の階層に合わせます
        dupe_image: i.mediumImageUrls?.[0]?.imageUrl || "https://via.placeholder.com/300",
        link: i.itemUrl || "#",
      };
    });

    return NextResponse.json(items);

  } catch (error: any) {
    console.error("サーバー側エラー:", error.message);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}