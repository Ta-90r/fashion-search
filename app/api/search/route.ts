import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, match_threshold = 0.7, match_count = 5 } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    // ① embedding 作成
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // ② Supabase RPC
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold,
      match_count,
    });

    if (error) {
      console.error("SUPABASE RPC ERROR:", error);
      return NextResponse.json(
        {
          error: "supabase rpc failed",
          supabaseError: error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      results: data,
    });
  } catch (err) {
    console.error("SEARCH FAILED DETAIL:", err);
    return NextResponse.json(
      {
        error: "search failed",
        detail: String(err),
      },
      { status: 500 }
    );
  }
}
