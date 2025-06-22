import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '@/app/api/axios';
import { AxiosError } from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();
    
    // 僅取最後一條用戶訊息
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    
    if (!lastUserMessage) {
      return NextResponse.json(
        { error: '未找到用戶訊息' },
        { status: 400 }
      );
    }
    
    // 訪問後端API
    const response = await axiosInstance.post('/chat', {
      message: lastUserMessage.content,
      model: model || 'gemini',
    });
    
    // 返回結果
    return NextResponse.json({ response: response.data.response });
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