'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">ダッシュボード</h2>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <div className="text-gray-600 text-sm">進行中案件</div>
              <div className="text-3xl font-bold text-blue-600">12</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-gray-600 text-sm">期限3日以内</div>
              <div className="text-3xl font-bold text-orange-600">5</div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <div className="text-gray-600 text-sm">本日期限</div>
              <div className="text-3xl font-bold text-red-600">2</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold mb-3 text-red-600">⚠️ 期限が近いタスク（3日以内）</h3>
              <div className="space-y-2">
                <Link 
                  href="/projects/1"
                  className="block p-3 border-l-4 border-red-500 bg-red-50 cursor-pointer hover:bg-red-100"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">37-098 契約書締結</span>
                    <span className="text-red-600 text-sm">本日期限</span>
                  </div>
                  <div className="text-sm text-gray-600">○○市浄化センター電気設備工事</div>
                </Link>
                <Link
                  href="/projects/1" 
                  className="block p-3 border-l-4 border-orange-500 bg-orange-50 cursor-pointer hover:bg-orange-100"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">37-101 施工計画書作成</span>
                    <span className="text-orange-600 text-sm">明日期限</span>
                  </div>
                  <div className="text-sm text-gray-600">△△製作所ポンプ設置工事</div>
                </Link>
                <Link 
                  href="/projects/1"
                  className="block p-3 border-l-4 border-yellow-500 bg-yellow-50 cursor-pointer hover:bg-yellow-100"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">37-095 工程表提出</span>
                    <span className="text-yellow-600 text-sm">2日後</span>
                  </div>
                  <div className="text-sm text-gray-600">□□工場電気設備更新</div>
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold mb-3">📊 進行中案件</h3>
              <div className="space-y-2">
                <Link 
                  href="/projects/1"
                  className="block p-3 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">37-098 ○○市浄化センター</span>
                    <span className="status-badge bg-blue-100 text-blue-700">施工中</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">進捗率: 65%</div>
                </Link>
                <Link 
                  href="/projects/2"
                  className="block p-3 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">37-101 △△製作所</span>
                    <span className="status-badge bg-green-100 text-green-700">着工準備</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">進捗率: 25%</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}