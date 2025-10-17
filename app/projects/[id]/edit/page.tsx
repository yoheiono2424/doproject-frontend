'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockProjects, mockPartners } from '@/app/lib/mockData';
import { usePermissions } from '@/app/lib/usePermissions';

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { canEditProjectDetails } = usePermissions();
  const projectId = params.id as string;

  const project = mockProjects.find(p => p.id === projectId);

  const [formData, setFormData] = useState({
    orderNo: '',
    contractType: '',
    projectType: '',
    amount: '',
    partnerId: '',
    clientName: '',
    siteName: '',
    projectName: '',
    startDate: '',
    endDate: '',
    manager: '',
    engineer: '',
    exclusive: false,
    changeReason: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (project) {
      setFormData({
        orderNo: project.orderNo,
        contractType: project.contractType,
        projectType: project.type,
        amount: project.amount.toString(),
        partnerId: project.partnerId || '',
        clientName: project.clientName,
        siteName: project.siteName,
        projectName: project.projectName,
        startDate: project.startDate,
        endDate: project.endDate,
        manager: project.manager || '',
        engineer: project.engineer,
        exclusive: project.exclusive || false,
        changeReason: ''
      });
    }
  }, [project]);

  if (!isAuthenticated) {
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="content-area p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            案件が見つかりません
          </div>
          <Link href="/projects" className="text-blue-600 hover:underline mt-4 inline-block">
            案件一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // 一般ユーザーは協力会社のみ編集可能
  const isRestrictedUser = !canEditProjectDetails();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!formData.orderNo || !formData.contractType || !formData.clientName || !formData.projectName) {
      alert('必須項目を入力してください');
      return;
    }

    // 実際の実装では、ここでSupabaseにデータを保存
    console.log('案件基本情報更新:', {
      projectId,
      originalData: project,
      updatedData: formData
    });

    alert('案件情報を更新しました（実装：操作ログに記録）');
    router.push(`/projects/${projectId}`);
  };

  const handleCancel = () => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">
                  ← 案件詳細に戻る
                </Link>
                <h2 className="text-2xl font-bold">基本情報編集</h2>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {project.orderNo} - {project.projectName}
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* 基本情報 */}
            <div className="bg-white rounded shadow mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold">案件基本情報</h3>
                {isRestrictedUser && (
                  <p className="text-sm text-gray-600 mt-1">※ 一般ユーザーは協力会社のみ編集できます</p>
                )}
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      受注No <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="orderNo"
                      value={formData.orderNo}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      disabled={isRestrictedUser}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      元請/下請 <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="contractType"
                      value={formData.contractType}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      disabled={isRestrictedUser}
                      required
                    >
                      <option value="">選択してください</option>
                      <option value="元">元請</option>
                      <option value="下">下請</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      種別 <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      disabled={isRestrictedUser}
                      required
                    >
                      <option value="機械">機械</option>
                      <option value="電気">電気</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">契約金額</label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      placeholder="千円単位"
                      disabled={isRestrictedUser}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">協力会社</label>
                    <select
                      name="partnerId"
                      value={formData.partnerId}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">選択してください（任意）</option>
                      {mockPartners.map((partner) => (
                        <option key={partner.id} value={partner.id}>
                          {partner.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 詳細情報 */}
            <div className="bg-white rounded shadow mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold">詳細情報</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      客先名 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      disabled={isRestrictedUser}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">現場名/場所</label>
                    <input
                      type="text"
                      name="siteName"
                      value={formData.siteName}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      disabled={isRestrictedUser}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      件名 <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="projectName"
                      value={formData.projectName}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      disabled={isRestrictedUser}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">工期開始日</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      disabled={isRestrictedUser}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">工期終了日</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      disabled={isRestrictedUser}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">担当者</label>
                    <select
                      name="manager"
                      value={formData.manager}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      disabled={isRestrictedUser}
                    >
                      <option value="">選択してください</option>
                      <option value="田中">田中</option>
                      <option value="佐藤">佐藤</option>
                      <option value="高橋">高橋</option>
                      <option value="鈴木">鈴木</option>
                      <option value="山田">山田</option>
                      <option value="伊藤">伊藤</option>
                      <option value="山本">山本</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">主任技術者/代理人</label>
                    <input
                      type="text"
                      name="engineer"
                      value={formData.engineer}
                      onChange={handleInputChange}
                      className={`w-full border rounded px-3 py-2 ${isRestrictedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                      disabled={isRestrictedUser}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={`flex items-center ${isRestrictedUser ? 'text-gray-500 cursor-not-allowed' : ''}`}>
                      <input
                        type="checkbox"
                        name="exclusive"
                        checked={formData.exclusive}
                        onChange={handleInputChange}
                        className="mr-2"
                        disabled={isRestrictedUser}
                      />
                      <span>専任配置</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 変更理由 */}
            <div className="bg-white rounded shadow mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold">変更理由</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">変更理由（任意）</label>
                  <textarea
                    name="changeReason"
                    value={formData.changeReason}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="案件情報変更の理由や詳細を入力してください"
                  />
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                更新
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}