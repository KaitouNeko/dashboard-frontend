
export interface AuthState {
  userInfo: UserInfo | null;
  token: string;
  setUserInfo: (state: UserInfo | null) => void;
  setToken: (state: string) => void;
}

export interface UserInfo {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  name: string;
  status: number;
  permission: number;
}