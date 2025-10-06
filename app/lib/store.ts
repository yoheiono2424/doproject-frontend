import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (username: string, password: string) => {
    // モックログイン（実際のプロダクションではSupabase Authを使用）
    if (username === 'admin' && password === 'password') {
      set({
        user: { id: '1', name: '山田太郎', role: 'admin' },
        isAuthenticated: true,
      });
      return true;
    }
    return false;
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));