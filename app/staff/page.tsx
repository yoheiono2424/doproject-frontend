'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';

export default function StaffPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const employees = [
    { id: 1, name: '髙峯 一郎', qualification: '1級電気工事施工管理技士', specialty: '電気' },
    { id: 2, name: '杉田 次郎', qualification: '1級管工事施工管理技士', specialty: '機械' },
    { id: 3, name: '中村 三郎', qualification: '2級管工事施工管理技士', specialty: '機械' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">従業員管理</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded shadow">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold">社員マスター</h3>
            </div>
            <div className="p-4">
              <table className="w-full mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">社員名</th>
                    <th className="p-2 text-left">資格</th>
                    <th className="p-2 text-center">専門</th>
                    <th className="p-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b">
                      <td className="p-2">{emp.name}</td>
                      <td className="p-2">{emp.qualification}</td>
                      <td className="p-2 text-center">{emp.specialty}</td>
                      <td className="p-2 text-center">
                        <button className="text-blue-600 hover:underline">編集</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link
                href="/staff/staff/new"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-block"
              >
                ＋ 社員追加
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}