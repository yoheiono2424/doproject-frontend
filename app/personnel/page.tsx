'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';

export default function PersonnelPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState('2025-01');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const engineers = [
    {
      id: 1,
      name: '髙峯 一郎',
      qualification: '1級電気工事施工管理技士',
      specialty: '電気',
      jan: '○○市浄化センター',
      feb: '○○市浄化センター',
      mar: '○○市浄化センター',
      status: '専任'
    },
    {
      id: 2,
      name: '杉田 次郎',
      qualification: '1級管工事施工管理技士',
      specialty: '機械',
      jan: '□□処理場\n△△製作所',
      feb: '△△製作所',
      mar: '-',
      status: '兼任可'
    },
    {
      id: 3,
      name: '中村 三郎',
      qualification: '2級管工事施工管理技士',
      specialty: '機械',
      jan: '-',
      feb: '-',
      mar: '◇◇工業',
      status: '配置可'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">人員配置管理 - {selectedMonth.replace('-', '年')}月</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded shadow mb-6">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold">技術者別配置状況</h3>
            </div>
            <div className="p-4">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">技術者名</th>
                    <th className="p-2 text-left">資格</th>
                    <th className="p-2 text-left">専門</th>
                    <th className="p-2 text-center">1月配置</th>
                    <th className="p-2 text-center">2月配置</th>
                    <th className="p-2 text-center">3月配置</th>
                    <th className="p-2 text-center">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {engineers.map((engineer) => (
                    <tr key={engineer.id} className="border-b">
                      <td className="p-2">{engineer.name}</td>
                      <td className="p-2">{engineer.qualification}</td>
                      <td className="p-2">{engineer.specialty}</td>
                      <td className="p-2 text-center whitespace-pre-line">{engineer.jan}</td>
                      <td className="p-2 text-center">{engineer.feb}</td>
                      <td className="p-2 text-center">{engineer.mar}</td>
                      <td className="p-2 text-center">
                        <span className={`status-badge ${
                          engineer.status === '専任' ? 'bg-red-100 text-red-700' :
                          engineer.status === '兼任可' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {engineer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded shadow">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold">配置調整</h3>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">案件選択</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>37-098 ○○市浄化センター</option>
                  <option>37-101 △△製作所</option>
                  <option>38-001 ◇◇工業</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">技術者選択</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>髙峯 一郎（電気）- 専任中</option>
                  <option>杉田 次郎（機械）- 兼任可</option>
                  <option>中村 三郎（機械）- 配置可</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">配置期間</label>
                <div className="flex gap-2">
                  <input type="date" className="border rounded px-3 py-2" />
                  <span className="py-2">〜</span>
                  <input type="date" className="border rounded px-3 py-2" />
                </div>
              </div>
              <button
                onClick={() => alert('配置を更新しました')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                配置を確定
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}