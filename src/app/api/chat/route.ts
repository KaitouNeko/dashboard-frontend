import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '@/app/api/axios';
import { AxiosError } from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, sessionId } = await req.json();
    
    // 驗證必要參數
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: '未提供有效的訊息' },
        { status: 400 }
      );
    }
    
    // 取最後一條用戶訊息
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: '未找到用戶訊息' },
        { status: 400 }
      );
    }
    
    // 準備傳送給後端的資料
    const backendPayload = {
      message: lastUserMessage.content,
      model: model || 'gemini',
      sessionId: sessionId || null,
      // 傳送對話歷史給後端 (用於上下文理解)
      conversationHistory: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt || new Date().toISOString()
      }))
    };
    
    // 訪問後端API
    const response = await axiosInstance.post('/chat', backendPayload);
    
    // 返回結果
    return NextResponse.json({ 
      response: response.data.response,
      sessionId: sessionId // 回傳 sessionId 以便前端確認
    });
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      console.error('API代理錯誤:', error.response.data);
      return NextResponse.json(
        { error: error.response.data.error || '請求失敗' },
        { status: error.response.status }
      );
    }
    
    console.error('未知錯誤:', error);
    return NextResponse.json(
      { error: '處理請求時發生內部錯誤' },
      { status: 500 }
    );
  }
} 