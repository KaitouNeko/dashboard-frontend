import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, model, embedding_model } = await req.json();

    // 僅取最後一條用戶訊息
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "user");

    if (!lastUserMessage) {
      return NextResponse.json({ error: "未找到用戶訊息" }, { status: 400 });
    }

    // 訪問後端API
    const apiUrl = `${
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:2469"
    }/api/rag`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: lastUserMessage.content,
        model: model || "gemini",
        embedding_model: embedding_model || "openai-ada-002",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "請求失敗" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 返回結果
    return NextResponse.json({ response: data.response });
  } catch (error) {
    console.error("RAG API代理錯誤:", error);
    return NextResponse.json({ error: "處理請求時發生錯誤" }, { status: 500 });
  }
}
