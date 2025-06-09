'use client';
import useAuthStore from '@/state/authstore';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}
const GuardLayout = ({ children }: Props) => {
  const { token } = useAuthStore((state) => state);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (token && pathname === '/') {
      router.push('/dashboard');
    }
    if (!token && pathname !== '/') {
      router.push('/');
    }
  }, [token, pathname]);

  if (!token && pathname !== '/') return null;
  return <div>{children}</div>;
};

export default GuardLayout;
