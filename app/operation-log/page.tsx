'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';

export default function OperationLogPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [startDate, setStartDate] = useState('2025-01-16');
  const [endDate, setEndDate] = useState('2025-01-16');
  const [filterOperation, setFilterOperation] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const logs = [
    {
      id: 1,
      datetime: '2025/01/16 15:43:15',
      user: '田中次郎',
      type: 'タスク完了',
      typeColor: 'bg-green-100 text-green-700',
      target: '37-098',
      detail: '「契約書締結」を完了しました'
    },
    {
      id: 2,
      datetime: '2025/01/16 14:30:45',
      user: '佐藤三郎',
      type: 'PDFアップ',
      typeColor: 'bg-orange-100 text-orange-700',
      target: '37-101',
      detail: '「設計図面.pdf」をアップロード'
    },
    {
      id: 3,
      datetime: '2025/01/16 14:15:20',
      user: '髙峯一郎',
      type: '人員配置',
      typeColor: 'bg-purple-100 text-purple-700',
      target: '37-098',
      detail: '主任技術者を「髙峯一郎」に変更'
    },
    {
      id: 4,
      datetime: '2025/01/16 13:45:10',
      user: '田中次郎',
      type: '案件編集',
      typeColor: 'bg-yellow-100 text-yellow-700',
      target: '37-101',
      detail: '工期を「26.01.15-26.02.28」に変更'
    },
    {
      id: 5,
      datetime: '2025/01/16 11:20:33',
      user: '山田花子',
      type: 'タスク完了',
      typeColor: 'bg-green-100 text-green-700',
      target: '37-095',
      detail: '「工程表提出」を完了しました'
    },
    {
      id: 6,
      datetime: '2025/01/16 10:30:15',
      user: '高橋太郎',
      type: '案件登録',
      typeColor: 'bg-red-100 text-red-700',
      target: '38-002',
      detail: '新規案件「□□工場電気設備」を登録'
    },
    {
      id: 7,
      datetime: '2025/01/16 09:45:50',
      user: '佐藤三郎',
      type: '写真撮影',
      typeColor: 'bg-orange-100 text-orange-700',
      target: '37-098',
      detail: '工事写真をアップロード（電気室）'
    },
  ];

  const handleExport = () => {
    alert('操作履歴をCSVファイルでエクスポートしました');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">操作履歴</h2>
            <div className="flex gap-2">
              <input
                type="date"
                className="border rounded px-3 py-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="py-1">〜</span>
              <input
                type="date"
                className="border rounded px-3 py-1"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                検索
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded shadow">
            <div className="p-4">
              <div className="mb-4 flex gap-4">
                <select
                  className="border rounded px-3 py-2"
                  value={filterOperation}
                  onChange={(e) => setFilterOperation(e.target.value)}
                >
                  <option value="all">全ての操作</option>
                  <option value="register">案件登録</option>
                  <option value="edit">案件編集</option>
                  <option value="complete">タスク完了</option>
                  <option value="upload">PDFアップロード</option>
                  <option value="personnel">人員配置変更</option>
                </select>
                <select
                  className="border rounded px-3 py-2"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                >
                  <option value="all">全ユーザー</option>
                  <option value="高橋太郎">高橋太郎</option>
                  <option value="田中次郎">田中次郎</option>
                  <option value="佐藤三郎">佐藤三郎</option>
                  <option value="山田花子">山田花子</option>
                </select>
                <button
                  onClick={handleExport}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  💾 CSVエクスポート
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">日時</th>
                      <th className="p-2 text-left">ユーザー名</th>
                      <th className="p-2 text-left">操作種別</th>
                      <th className="p-2 text-left">対象</th>
                      <th className="p-2 text-left">詳細</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{log.datetime}</td>
                        <td className="p-2">{log.user}</td>
                        <td className="p-2">
                          <span className={`text-xs ${log.typeColor} px-2 py-1 rounded`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="p-2">{log.target}</td>
                        <td className="p-2">{log.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-sm text-gray-600 text-center">
                全 {logs.length} 件
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}