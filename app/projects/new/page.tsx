'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';

export default function ProjectRegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [contractType, setContractType] = useState('');
  const [formData, setFormData] = useState({
    orderNo: '',
    contractType: '',
    projectType: '機械',
    amount: '',
    clientName: '',
    siteName: '',
    projectName: '',
    startDate: '',
    endDate: '',
    manager: '',
    engineer: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const updateTaskCount = (value: string) => {
    setContractType(value);
    setFormData({ ...formData, contractType: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!formData.orderNo || !formData.contractType || !formData.clientName || !formData.projectName) {
      alert('必須項目を入力してください');
      return;
    }

    // ここで実際の登録処理を行う
    alert('案件を登録しました');
    router.push('/projects');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">新規案件登録</h2>
            <Link href="/projects" className="text-blue-600 hover:underline">
              ← キャンセル
            </Link>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* 基本情報 */}
            <div className="bg-white rounded shadow mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold">案件基本情報</h3>
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
                      className="w-full border rounded px-3 py-2"
                      placeholder="例: 38-001"
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
                      onChange={(e) => updateTaskCount(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">選択してください</option>
                      <option value="元">元請（18タスク自動生成）</option>
                      <option value="下">下請（6タスク自動生成）</option>
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
                      className="w-full border rounded px-3 py-2"
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
                      className="w-full border rounded px-3 py-2"
                      placeholder="千円単位"
                    />
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
                      className="w-full border rounded px-3 py-2"
                      placeholder="例: ○○市"
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
                      className="w-full border rounded px-3 py-2"
                      placeholder="例: ○○浄化センター"
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
                      className="w-full border rounded px-3 py-2"
                      placeholder="例: ○○浄化センター電気設備改修工事"
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
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">工期終了日</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">担当者</label>
                    <select
                      name="manager"
                      value={formData.manager}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
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
                      className="w-full border rounded px-3 py-2"
                      placeholder="例: 山田太郎"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* タスク生成情報 */}
            <div className="bg-white rounded shadow mb-6">
              <div className="p-4 bg-blue-50 rounded">
                <div className="text-sm text-blue-700">
                  {contractType === '元' ? (
                    <>
                      <strong>元請案件として18個のタスクが自動生成されます：</strong><br />
                      契約フェーズ(5) → 着工準備(4) → 施工(3) → 竣工(6)
                    </>
                  ) : contractType === '下' ? (
                    <>
                      <strong>下請案件として6個のタスクが自動生成されます：</strong><br />
                      契約確認、施工計画確認、施工実施、工事写真提出、完了報告、請求書発行
                    </>
                  ) : (
                    '元請/下請を選択すると、自動生成されるタスク数が表示されます'
                  )}
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                登録する
              </button>
              <Link
                href="/projects"
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 inline-block text-center"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}