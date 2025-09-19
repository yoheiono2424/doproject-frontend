'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store';

const menuItems = [
  { href: '/dashboard', icon: '📊', label: 'ダッシュボード' },
  { href: '/projects', icon: '📁', label: '案件一覧' },
  { href: '/schedule', icon: '📅', label: '工程表' },
  { href: `/schedule/${new Date().getFullYear()}/${new Date().getMonth() + 1}`, icon: '✅', label: 'タスクカレンダー' },
  { href: '/personnel', icon: '👥', label: '人員配置管理' },
  { href: '/settings', icon: '⚙️', label: 'システム設定' },
  { href: '/operation-log', icon: '📜', label: '操作履歴' },
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
          // タスクカレンダーの場合は特別な処理
          const isTaskCalendar = item.label === 'タスクカレンダー';
          const isActive = isTaskCalendar
            ? pathname.startsWith('/schedule/') && pathname.split('/').length === 4
            : pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`w-full text-left p-2 hover:bg-gray-700 rounded flex items-center gap-2 block ${
                  isActive ? 'bg-gray-700' : ''
                }`}
              >
                <span>{item.icon}</span>
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
          <span>🚪</span>
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
}