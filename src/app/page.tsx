import { auth } from '@clerk/nextjs/server'
import {
  SignInButton,
  SignUpButton,
  SignedOut,
} from '@clerk/nextjs'
import { LoginForm } from '@/components/login-form'

const HomePage = async () => {

  const { userId } = await auth()

  // 如果沒有登入，顯示未登入狀態
  if (!userId) {
    return (
      <>
        <header className="flex justify-end items-center p-4 gap-4 h-16">
          <SignedOut>
            <SignInButton />
            <SignUpButton>
              <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
        </header>
        {/* 未來可以顯示酷炫動畫 */}
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
            <LoginForm />
          </div>
        </div>
      </>

    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
    </div>
  )
}

export default HomePage