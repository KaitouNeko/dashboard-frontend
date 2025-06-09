import { AuthState } from '@/types/interface';
import { create } from 'zustand';

const useAuthStore = create<AuthState>((set) => ({
  userInfo: null,
  token: '',
  setUserInfo: (userInfo) => set(() => ({ userInfo: userInfo })),
  setToken: (token) => set({ token }),
}))

export default useAuthStore;