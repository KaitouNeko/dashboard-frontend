import { auth } from '@clerk/nextjs/server'
import ClientAuth from '@/components/client-auth'

const HomePage = async () => {
  // Server-side
  const { userId } = await auth()
  
  // 如果沒有登入，顯示未登入狀態
  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Clerk SSR 示範應用程式</h1>
            <p className="text-lg text-gray-600">請先登入以繼續使用</p>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Server Component 狀態</h2>
            <p className="text-red-700">用戶未登入 - 這是從 Server Component 檢測到的</p>
          </div>

          <ClientAuth />
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <ClientAuth />
    </div>
  )
}

export default HomePage