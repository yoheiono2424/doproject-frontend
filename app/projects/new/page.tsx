'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockPartners, mockStaff } from '@/app/lib/mockData';
import { usePermissions } from '@/app/lib/usePermissions';

export default function ProjectRegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { canEditProjectDetails } = usePermissions();
  const [contractType, setContractType] = useState('');
  const [formData, setFormData] = useState({
    orderNo: '',
    contractType: '',
    workType: '工事',
    projectType: '機械',
    amount: '',
    partnerId: '',
    clientName: '',
    siteName: '',
    projectName: '',
    startDate: '',
    endDate: '',
    manager: '',
    engineer: '',
    clientCompanyName: '',
    clientContactName: '',
    clientPhone: '',
    clientEmail: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  // 権限チェック：高権限ユーザー以外はアクセス不可
  if (!canEditProjectDetails()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="content-area">
          <div className="bg-white shadow">
            <div className="p-4 border-b">
              <h2 className="text-2xl font-bold">新規案件登録</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-white rounded shadow p-6 text-center">
              <p className="text-red-600 text-lg font-bold mb-4">アクセス権限がありません</p>
              <p className="text-gray-600 mb-6">この機能は部長クラス以上、総務部、または個別権限を持つユーザーのみ利用できます。</p>
              <Link href="/projects" className="text-blue-600 hover:underline">
                ← 案件一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const updateTaskCount = (value: string) => {
    setContractType(value);
    setFormData({ ...formData, contractType: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!formData.orderNo || !formData.contractType || !formData.clientName || !formData.projectName || !formData.manager || !formData.engineer) {
      alert('必須項目を入力してください');
      return;
    }

    // 【v2.26】登録後の自動遷移ロジック
    const currentUser = useAuthStore.getState().user;
    const loginUserName = currentUser?.name || '';

    // 仮の新規案件ID（実際のバックエンド実装時は登録APIから返されるIDを使用）
    const newProjectId = '999';

    // 登録者 = 担当者の場合
    if (loginUserName === formData.manager) {
      alert('案件を登録しました。タスク割り当てを行ってください。');
      router.push(`/projects/${newProjectId}/tasks`);
    } else {
      // 登録者 ≠ 担当者の場合
      alert(`案件を登録しました。担当者（${formData.manager}）にタスク割り当て依頼を送信しました。`);
      router.push('/projects');
    }
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
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
                  <div className="col-span-1">
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
                  <div className="col-span-1">
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
                  <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">
                      工事カテゴリー <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="workType"
                      value={formData.workType}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="工事">工事</option>
                      <option value="保守点検">保守点検</option>
                      <option value="機器制作">機器制作</option>
                    </select>
                  </div>
                  <div className="col-span-2">
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
                      <option value="鋼造">鋼造</option>
                      <option value="通信">通信</option>
                      <option value="納品">納品</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium mb-1">
                      協力会社
                    </label>
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
                    <label className="block text-sm font-medium mb-1">
                      担当者 <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="manager"
                      value={formData.manager}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">選択してください</option>
                      {mockStaff.map((staff) => (
                        <option key={staff.id} value={staff.name}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      主任技術者/代理人 <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="engineer"
                      value={formData.engineer}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">選択してください</option>
                      {mockStaff.map((staff) => (
                        <option key={staff.id} value={staff.name}>
                          {staff.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* クライアント情報 */}
            <div className="bg-white rounded shadow mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold">クライアント情報</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">クライアント会社名</label>
                    <input
                      type="text"
                      name="clientCompanyName"
                      value={formData.clientCompanyName}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="例: 株式会社○○"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">担当者名</label>
                    <input
                      type="text"
                      name="clientContactName"
                      value={formData.clientContactName}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="例: 山田太郎"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">連絡先TEL</label>
                    <input
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="例: 03-1234-5678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">メール</label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="例: yamada@example.com"
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