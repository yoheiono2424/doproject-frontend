'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { mockPartners } from '@/app/lib/mockData';
import { Search, Plus, Building2, Edit, Eye } from 'lucide-react';

export default function PartnersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // 検索フィルタリング
  const filteredPartners = mockPartners.filter((partner) =>
    partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.companyNameKana.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">協力会社管理</h2>
            <Link href="/partners/new">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2">
                <Plus size={20} />
                新規登録
              </button>
            </Link>
          </div>
        </div>

        <div className="p-6">

      {/* 検索バー */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="会社名・フリガナ・電話番号で検索"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 件数表示 */}
      <div className="mb-4 text-gray-600">
        {filteredPartners.length}件の協力会社
      </div>

      {/* 協力会社一覧テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                会社名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                担当者
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                電話番号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メールアドレス
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPartners.map((partner) => (
              <tr key={partner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{partner.companyName}</div>
                  <div className="text-sm text-gray-500">{partner.companyNameKana}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {partner.representative || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {partner.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {partner.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link href={`/partners/${partner.id}`}>
                      <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                        <Eye size={16} />
                        詳細
                      </button>
                    </Link>
                    <Link href={`/partners/${partner.id}/edit`}>
                      <button className="text-green-600 hover:text-green-900 flex items-center gap-1">
                        <Edit size={16} />
                        編集
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPartners.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            該当する協力会社が見つかりませんでした
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}
