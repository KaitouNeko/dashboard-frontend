'use client';

import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  useAuth
} from '@clerk/nextjs'
import useAuthStore from '@/state/authstore';

interface Props {
  children: React.ReactNode;
}

const GuardLayout = ({ children }: Props) => {
  const { token: localtoken } = useAuthStore((state) => state);
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // 異步獲取 token 並驗證
  useEffect(() => {
    const fetchTokenAndValidate = async () => {
      if (isLoaded && isSignedIn) {
        try {
          setLoading(true);

          // 1. 獲取 Clerk token
          const clerkToken = await getToken();
          setToken(clerkToken);

          if (clerkToken) {
            // 2. 驗證 token 合法性
            const response = await fetch('http://localhost:2469/api/auth/verify-token', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${clerkToken}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              console.log('Token validation result:', data);
              setValid(data.valid || false);
            } else {
              console.error('Token validation failed:', response.status);
              setValid(false);
            }
          } else {
            setValid(false);
          }
        } catch (error) {
          console.error('Error during token validation:', error);
          setToken(null);
          setValid(false);
        } finally {
          setLoading(false);
        }
      } else if (isLoaded && !isSignedIn) {
        setToken(null);
        setValid(false);
        setLoading(false);
      }
    };

    fetchTokenAndValidate();
  }, [isLoaded, isSignedIn, getToken]);

  // 處理路由跳轉邏輯
  useEffect(() => {
    if (!isLoaded || loading) return; // 等待載入完成

    // 檢查是否已認證（Clerk 認證 或 本地 token）
    const isAuthenticated = (isSignedIn && valid) || localtoken;

    // 已認證 + 在首頁 → 跳轉到 dashboard
    if (isAuthenticated && pathname === '/') {
      router.push('/dashboard');
    }

    // 未認證 + 不在首頁 → 跳轉回首頁
    if (!isAuthenticated && pathname !== '/') {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, valid, pathname, router, loading, localtoken]);

  // 載入中狀態
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-sm text-gray-600">
            {!isLoaded ? '載入認證資訊...' : '驗證用戶權限...'}
          </p>
        </div>
      </div>
    );
  }

  // 未登入或 token 無效且不在首頁時不顯示內容
  const isAuthenticated = (isSignedIn && valid) || localtoken;
  if (!isAuthenticated && pathname !== '/') return null;

  return <div>{children}</div>;
};

export default GuardLayout;
