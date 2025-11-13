'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockStaff } from '@/app/lib/mockData';
import { usePermissions } from '@/app/lib/usePermissions';

// タブの型定義
type TabType = 'basic' | 'qualifications';

// 保有資格データの型定義
type QualificationRow = {
  employeeId: string;
  employeeName: string;
  qualificationName: string;
  category: string;
  expiryDate: string | null;
  daysRemaining: number | null;
};

export default function StaffPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { canAccessEmployeeManagement } = usePermissions();
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'qualification'>('expiry');
  const [qualificationData, setQualificationData] = useState<QualificationRow[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // 保有資格データの作成
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows: QualificationRow[] = [];

    mockStaff.forEach((emp) => {
      if (emp.qualifications && emp.qualifications.length > 0) {
        emp.qualifications.forEach((qual: any) => {
          let daysRemaining: number | null = null;
          let expiryDate: string | null = null;

          // 失効日の計算（免許カテゴリのみ）
          if (qual.category1 === '免許' && qual.expiryDate) {
            expiryDate = qual.expiryDate;
            const expiry = new Date(qual.expiryDate);
            expiry.setHours(0, 0, 0, 0);
            daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          }

          // 資格名の組み立て
          let qualificationName = '';
          if (qual.customName) {
            qualificationName = qual.customName;
          } else if (qual.qualificationDetail) {
            qualificationName = `${qual.qualificationName}（${qual.qualificationDetail}）`;
          } else {
            qualificationName = qual.qualificationName;
          }

          rows.push({
            employeeId: emp.id,
            employeeName: emp.name,
            qualificationName: qualificationName,
            category: qual.category1,
            expiryDate: expiryDate,
            daysRemaining: daysRemaining
          });
        });
      }
    });

    setQualificationData(rows);
  }, []);

  // 全角数字を半角数字に変換する関数
  const normalizeNumber = (str: string) => {
    return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  };

  // 検索フィルター適用（資格名と従業員名で検索、全角半角数字を統一）
  const filteredQualifications = qualificationData.filter((row) => {
    const normalizedSearchTerm = normalizeNumber(searchTerm.toLowerCase());
    const normalizedQualificationName = normalizeNumber(row.qualificationName.toLowerCase());
    const normalizedEmployeeName = normalizeNumber(row.employeeName.toLowerCase());

    return normalizedQualificationName.includes(normalizedSearchTerm) ||
           normalizedEmployeeName.includes(normalizedSearchTerm);
  });

  // ソート適用
  const sortedQualifications = [...filteredQualifications].sort((a, b) => {
    if (sortBy === 'expiry') {
      // 失効日が近い順（失効日なしは最後）
      if (a.daysRemaining === null && b.daysRemaining === null) return 0;
      if (a.daysRemaining === null) return 1;
      if (b.daysRemaining === null) return -1;
      return a.daysRemaining - b.daysRemaining;
    } else if (sortBy === 'name') {
      // 従業員名順
      return a.employeeName.localeCompare(b.employeeName);
    } else {
      // 資格名順
      return a.qualificationName.localeCompare(b.qualificationName);
    }
  });

  // 従業員ごとにグループ化
  const groupedByEmployee: { [employeeId: string]: QualificationRow[] } = {};
  sortedQualifications.forEach((row) => {
    if (!groupedByEmployee[row.employeeId]) {
      groupedByEmployee[row.employeeId] = [];
    }
    groupedByEmployee[row.employeeId].push(row);
  });

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
          {/* 自動車免許更新期限アラート（管理者向け） */}
          {canAccessEmployeeManagement() && (() => {
            // 有効期限が1ヶ月前（30日前）以降の従業員を抽出
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const oneMonthFromToday = new Date(today);
            oneMonthFromToday.setDate(oneMonthFromToday.getDate() + 30);

            // アラート対象の情報を収集
            const alerts: Array<{ empId: string; empName: string; type: string; item: string; expiryDate: string; daysRemaining: number }> = [];

            mockStaff.forEach((emp) => {
              // 自動車免許のチェック
              if (emp.driverLicenseExpiry) {
                const expiryDate = new Date(emp.driverLicenseExpiry);
                expiryDate.setHours(0, 0, 0, 0);
                if (expiryDate <= oneMonthFromToday && expiryDate >= today) {
                  const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  alerts.push({
                    empId: emp.id,
                    empName: emp.name,
                    type: 'driver_license',
                    item: '自動車免許',
                    expiryDate: emp.driverLicenseExpiry,
                    daysRemaining
                  });
                }
              }

              // 資格のチェック（免許カテゴリのみ）
              if (emp.qualifications && emp.qualifications.length > 0) {
                emp.qualifications.forEach((qual: any) => {
                  if (qual.category1 === '免許' && qual.expiryDate) {
                    const expiryDate = new Date(qual.expiryDate);
                    expiryDate.setHours(0, 0, 0, 0);
                    if (expiryDate <= oneMonthFromToday && expiryDate >= today) {
                      const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                      let qualificationDisplayName = '';
                      if (qual.qualificationDetail) {
                        qualificationDisplayName = `${qual.qualificationName}（${qual.qualificationDetail}）`;
                      } else {
                        qualificationDisplayName = qual.qualificationName;
                      }

                      alerts.push({
                        empId: emp.id,
                        empName: emp.name,
                        type: 'qualification',
                        item: qualificationDisplayName,
                        expiryDate: qual.expiryDate,
                        daysRemaining
                      });
                    }
                  }
                });
              }
            });

            // アラートがない場合は表示しない
            if (alerts.length === 0) return null;

            // 期限日が近い順にソート
            alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);

            return (
              <div className="mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded shadow p-4">
                  <h3 className="font-bold text-yellow-700 text-lg mb-3">
                    ⚠️ 免許・資格の更新期限が近づいている従業員（{alerts.length}件）
                  </h3>
                  <div className="space-y-2">
                    {alerts.map((alert, index) => (
                      <div
                        key={`${alert.empId}-${index}`}
                        className="bg-white p-3 rounded cursor-pointer hover:bg-yellow-100 transition-colors"
                        onClick={() => router.push(`/staff/${alert.empId}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold">{alert.empName}</span>さんの
                            <span className="font-semibold text-yellow-800">{alert.item}</span>
                            の有効期限が1ヶ月前に迫っています
                          </div>
                          <div className="text-sm text-gray-600">
                            期限：{alert.expiryDate} <span className="font-bold text-yellow-700">（残り{alert.daysRemaining}日）</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* タブ切り替え */}
          <div className="bg-white rounded shadow mb-6">
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === 'basic'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  基本情報
                </button>
                <button
                  onClick={() => setActiveTab('qualifications')}
                  className={`px-6 py-3 font-semibold transition-colors ${
                    activeTab === 'qualifications'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  保有資格
                </button>
              </div>
            </div>
          </div>

          {/* 基本情報タブ */}
          {activeTab === 'basic' && (
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
          )}

          {/* 保有資格タブ */}
          {activeTab === 'qualifications' && (
            <div className="bg-white rounded shadow">
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">保有資格一覧</h3>
                  <div className="text-sm text-gray-600">
                    表示件数: {sortedQualifications.length}件 / 全{qualificationData.length}件
                  </div>
                </div>
              </div>

              {/* 検索・ソート機能 */}
              <div className="p-4 border-b bg-gray-50 flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">従業員名・資格名で検索</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="従業員名または資格名を入力..."
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="w-64">
                  <label className="block text-sm font-medium mb-1">並び順</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'expiry' | 'name' | 'qualification')}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="expiry">失効日が近い順</option>
                    <option value="name">従業員名順</option>
                    <option value="qualification">資格名順</option>
                  </select>
                </div>
              </div>

              {/* 保有資格テーブル */}
              <div className="p-4 overflow-x-auto">
                {sortedQualifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    該当する資格が見つかりませんでした
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left font-semibold">従業員名</th>
                        <th className="p-3 text-left font-semibold">保有資格</th>
                        <th className="p-3 text-left font-semibold">カテゴリ</th>
                        <th className="p-3 text-left font-semibold">失効日</th>
                        <th className="p-3 text-center font-semibold">状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(groupedByEmployee).map(([employeeId, qualifications]) => {
                        return qualifications.map((row, qualIndex) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          let bgColor = '';
                          let statusIcon = '';
                          let statusText = '';

                          if (row.daysRemaining !== null) {
                            if (row.daysRemaining < 0) {
                              // 期限切れ
                              bgColor = 'bg-red-50';
                              statusIcon = '🔴';
                              statusText = '期限切れ';
                            } else if (row.daysRemaining <= 30) {
                              // 1ヶ月前以内
                              bgColor = 'bg-yellow-50';
                              statusIcon = '⚠️';
                              statusText = '間近';
                            } else {
                              statusText = '正常';
                            }
                          }

                          return (
                            <tr
                              key={`${employeeId}-${qualIndex}`}
                              className={`border-b hover:bg-gray-50 transition-colors ${bgColor}`}
                            >
                              {qualIndex === 0 && (
                                <td
                                  className="p-3 font-semibold cursor-pointer hover:text-blue-600"
                                  rowSpan={qualifications.length}
                                  onClick={() => router.push(`/staff/${employeeId}`)}
                                >
                                  {row.employeeName}
                                  <div className="text-xs text-gray-500 font-normal mt-1">
                                    資格数: {qualifications.length}件
                                  </div>
                                </td>
                              )}
                              <td className="p-3">{row.qualificationName}</td>
                              <td className="p-3">
                                <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                                  {row.category}
                                </span>
                              </td>
                              <td className="p-3">
                                {row.expiryDate ? (
                                  <div>
                                    <div>{row.expiryDate}</div>
                                    {row.daysRemaining !== null && (
                                      <div className="text-xs text-gray-600">
                                        （残り{row.daysRemaining}日）
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {statusIcon && (
                                  <div className="flex items-center justify-center gap-1">
                                    <span>{statusIcon}</span>
                                    <span className="text-sm font-semibold">{statusText}</span>
                                  </div>
                                )}
                                {!statusIcon && statusText && (
                                  <span className="text-sm text-gray-600">{statusText}</span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}