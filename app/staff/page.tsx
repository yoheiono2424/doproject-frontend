'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockStaff } from '@/app/lib/mockData';
import { usePermissions } from '@/app/lib/usePermissions';

export default function StaffPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { canAccessEmployeeManagement } = usePermissions();

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
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">従業員管理</h2>
            {canAccessEmployeeManagement() && (
              <Link
                href="/staff/staff/new"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ＋ 社員追加
              </Link>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded shadow">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold">社員マスター</h3>
            </div>
            <div className="p-4">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">社員番号／ID</th>
                    <th className="p-2 text-left">氏名（漢字）</th>
                    <th className="p-2 text-left">役職</th>
                    <th className="p-2 text-left">所属部署</th>
                    <th className="p-2 text-left">社用携帯番号</th>
                    <th className="p-2 text-left">社内メールアドレス</th>
                    <th className="p-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStaff.map((emp) => (
                    <tr key={emp.id} className="border-b">
                      <td className="p-2">{emp.employeeId}</td>
                      <td className="p-2">{emp.name}</td>
                      <td className="p-2">{emp.jobTitle}</td>
                      <td className="p-2">{emp.department}</td>
                      <td className="p-2">{emp.companyPhone}</td>
                      <td className="p-2">{emp.companyEmail}</td>
                      <td className="p-2 text-center">
                        {canAccessEmployeeManagement() ? (
                          <Link href={`/staff/${emp.id}`} className="text-blue-600 hover:underline">
                            詳細
                          </Link>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}