import { create } from 'zustand';
import { mockStaff } from './mockData';

interface User {
  id: string;
  name: string;
  role: string;
  jobTitle: string;
  department: string;
  hasAdminPermission: boolean;
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
    // 既存の管理者アカウント
    if (username === 'admin' && password === 'password') {
      set({
        user: {
          id: '1',
          name: '山田太郎',
          role: 'admin',
          jobTitle: '役員',
          department: '経営企画部',
          hasAdminPermission: true
        },
        isAuthenticated: true,
      });
      return true;
    }

    // テスト用アカウント（mockStaffから検索）
    const staff = mockStaff.find(s => s.companyEmail === username);
    if (staff && password === 'password123') {
      set({
        user: {
          id: staff.id,
          name: staff.name,
          role: 'staff',
          jobTitle: staff.jobTitle,
          department: staff.department,
          hasAdminPermission: staff.hasAdminPermission
        },
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