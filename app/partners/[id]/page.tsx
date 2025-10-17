'use client';

import { use } from 'react';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { mockPartners, mockPartnerDocuments, mockProjects } from '@/app/lib/mockData';
import {
  Building2,
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  Download,
  FolderOpen,
} from 'lucide-react';

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const partner = mockPartners.find((p) => p.id === resolvedParams.id);
  const documents = mockPartnerDocuments.filter((d) => d.partnerId === resolvedParams.id);

  // この協力会社が関わった案件を取得（モックデータでは仮想的に関連付け）
  // 実際のデータベースでは、案件テーブルに協力会社IDを持たせて取得
  const relatedProjects = mockProjects.filter((project) => {
    // モックデータでは、IDが奇数の協力会社はIDが奇数の案件に関連、等
    return parseInt(project.id) % 3 === parseInt(resolvedParams.id) % 3;
  }).slice(0, 5); // 最大5件まで表示

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="content-area p-6">
          <p className="text-red-500">協力会社が見つかりませんでした</p>
          <Link href="/partners">
            <button className="mt-4 text-blue-600 hover:text-blue-800">協力会社一覧に戻る</button>
          </Link>
        </div>
      </div>
    );
  }

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area p-6">
      <div className="mb-6">
        <Link href="/partners">
          <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4">
            <ArrowLeft size={20} />
            協力会社一覧に戻る
          </button>
        </Link>
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 size={32} />
            {partner.companyName}
          </h1>
          <Link href={`/partners/${partner.id}/edit`}>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2">
              <Edit size={20} />
              編集
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 会社情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">会社情報</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">会社名</label>
              <p className="text-lg font-medium">{partner.companyName}</p>
              <p className="text-sm text-gray-500">{partner.companyNameKana}</p>
            </div>

            <div className="flex items-start gap-2">
              <User size={20} className="text-gray-400 mt-1" />
              <div>
                <label className="text-sm font-medium text-gray-600">代表者名</label>
                <p>{partner.representative || '-'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone size={20} className="text-gray-400 mt-1" />
              <div>
                <label className="text-sm font-medium text-gray-600">会社の電話番号</label>
                <p>{partner.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin size={20} className="text-gray-400 mt-1" />
              <div>
                <label className="text-sm font-medium text-gray-600">所在地</label>
                <p>{partner.address || '-'}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">備考</label>
              <p className="whitespace-pre-wrap">{partner.notes || '-'}</p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-500">
                <span>登録日: {partner.registeredDate}</span>
                <span>更新日: {partner.updatedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 担当者情報 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">担当者情報</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <User size={20} className="text-gray-400 mt-1" />
              <div>
                <label className="text-sm font-medium text-gray-600">担当者名</label>
                <p>-</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Phone size={20} className="text-gray-400 mt-1" />
              <div>
                <label className="text-sm font-medium text-gray-600">担当者の電話番号</label>
                <p>-</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Mail size={20} className="text-gray-400 mt-1" />
              <div>
                <label className="text-sm font-medium text-gray-600">担当者のメールアドレス</label>
                <p>{partner.email || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 書類一覧 */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
          <FileText size={24} />
          書類一覧
        </h2>
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded p-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{doc.fileName}</p>
                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>登録日: {doc.uploadedDate}</span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Download size={18} />
                    DL
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">登録されている書類はありません</p>
        )}
      </div>

      {/* 案件履歴 */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
          <FolderOpen size={24} />
          案件履歴
        </h2>
        {relatedProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    受注No
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    案件名
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    工期
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    契約金額
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    ステータス
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {relatedProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.orderNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{project.projectName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {project.startDate} 〜 {project.endDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                      {project.amount ? `¥${project.amount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          project.status === '施工中'
                            ? 'bg-blue-100 text-blue-800'
                            : project.status === '契約済'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <Link href={`/projects/${project.id}`}>
                        <button className="text-blue-600 hover:text-blue-900">詳細</button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">関連する案件がありません</p>
        )}
      </div>
      </div>
    </div>
  );
}
