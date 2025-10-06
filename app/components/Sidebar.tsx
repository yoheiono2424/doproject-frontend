'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store';
import {
  Clock,
  FolderOpen,
  Calendar,
  CalendarDays,
  Users,
  Building2,
  ScrollText,
  LogOut
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', icon: Clock, label: '期限管理ダッシュボード' },
  { href: '/schedule', icon: Calendar, label: '工程表' },
  { href: '/projects', icon: FolderOpen, label: '案件一覧' },
  { href: `/schedule/${new Date().getFullYear()}/${new Date().getMonth() + 1}`, icon: CalendarDays, label: 'カレンダー' },
  { href: '/staff', icon: Users, label: '従業員管理' },
  { href: '/partners', icon: Building2, label: '協力会社管理' },
  { href: '/operation-log', icon: ScrollText, label: '操作履歴' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="sidebar text-white p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Do Project</h1>
        <p className="text-sm text-gray-400">進捗管理システム</p>
      </div>

      <ul className="space-y-2">
        {menuItems.map((item) => {
          // カレンダーの場合は特別な処理
          const isCalendar = item.label === 'カレンダー';
          const isActive = isCalendar
            ? pathname.startsWith('/schedule/') && pathname.split('/').length === 4
            : pathname === item.href;

          const IconComponent = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`w-full text-left p-2 hover:bg-gray-700 rounded flex items-center gap-2 block ${
                  isActive ? 'bg-gray-700' : ''
                }`}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="absolute bottom-4 left-4 right-4">
        {user && (
          <div className="text-sm text-gray-400 mb-2">
            ログイン: {user.name}
          </div>
        )}
        <button
          onClick={logout}
          className="w-full text-left p-2 hover:bg-gray-700 rounded text-sm flex items-center gap-2"
        >
          <LogOut size={18} />
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
}