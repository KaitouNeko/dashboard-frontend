'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useState } from 'react'

export default function ClientAuth() {
  const { isLoaded, isSignedIn, userId, sessionId, getToken } = useAuth()
  const { user } = useUser()
  const [apiData, setApiData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchProtectedData = async () => {
    try {
      setLoading(true)
      // 使用 getToken() 來獲取當前用戶的 session token
      const token = await getToken()
      console.log('token', token)
      // 使用 token 來從外部 API 或受保護的 route 獲取資料
      
      const response = await fetch('/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      setApiData(data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setApiData({ error: '獲取資料失敗' })
    } finally {
      setLoading(false)
    }


  }

  const fetchData = async () => {
    try {
      setLoading(true)
      // 使用 getToken() 來獲取當前用戶的 session token
      const token = await getToken()
      console.log('token', token)
      // 使用 token 來從外部 API 或受保護的 route 獲取資料
      
      const response = await fetch('http://localhost:2469/api/auth/user-profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      setApiData(data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setApiData({ error: '獲取資料失敗' })
    } finally {
      setLoading(false)
    }


  }


  // 使用 isLoaded 來檢查 Clerk 是否已載入
  if (!isLoaded) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="animate-pulse">Loading Clerk...</div>
      </div>
    )
  }

  // 使用 isSignedIn 來檢查用戶是否已登入
  if (!isSignedIn) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800">Client Component 狀態</h3>
        <p className="text-yellow-700">用戶未登入 - 這是從 Client Component 檢測到的</p>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Client Component 認證資訊</h3>
      
      <div className="space-y-2">
        <p><strong>用戶 ID:</strong> {userId}</p>
        <p><strong>Session ID:</strong> {sessionId}</p>
        <p><strong>用戶名稱:</strong> {user?.firstName} {user?.lastName}</p>
        <p><strong>Email:</strong> {user?.emailAddresses?.[0]?.emailAddress}</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={fetchProtectedData}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '載入中...' : '測試受保護的 API'}
        </button>
        <button
          onClick={fetchData}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '載入中...' : '測試Golang API'}
        </button>

        
        {apiData && (
          <div className="mt-4 p-3 rounded border">
            <h4 className="font-semibold mb-2">API 回應:</h4>
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 