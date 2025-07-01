import { NextResponse } from 'next/server'
import { currentUser, auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    // 使用 auth() 獲取用戶 ID
    const { userId } = await auth()

    // 檢查用戶是否已登入 - 保護 API route
    if (!userId) {
      return NextResponse.json(
        { error: '未授權訪問', message: '請先登入' }, 
        { status: 401 }
      )
    }

    // 使用 currentUser() 獲取完整的 Backend API 用戶對象
    const user = await currentUser()

    if (!user) {
      return NextResponse.json(
        { error: '找不到用戶', message: '用戶資料不存在' }, 
        { status: 404 }
      )
    }

    // 返回用戶資料 (可以根據需要過濾敏感資訊)
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddresses: user.emailAddresses?.map(email => ({
        emailAddress: email.emailAddress,
        verified: email.verification?.status === 'verified'
      })),
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      imageUrl: user.imageUrl
    }

    return NextResponse.json({ 
      message: '成功獲取用戶資料',
      user: userData 
    }, { status: 200 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: '伺服器錯誤', message: '無法獲取用戶資料' }, 
      { status: 500 }
    )
  }
} 