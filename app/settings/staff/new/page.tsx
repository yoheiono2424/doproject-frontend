'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';

export default function StaffRegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    nameKana: '',
    employeeNumber: '',
    hireDate: '',
    specialty: '',
    otherQualifications: '',
    exclusivePlacement: 'possible',
    remarks: '',
  });

  const [qualifications, setQualifications] = useState({
    firstClassElectrical: false,
    secondClassElectrical: false,
    firstClassPiping: false,
    secondClassPiping: false,
    firstTypeElectrical: false,
    secondTypeElectrical: false,
    other: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleQualificationChange = (qualification: string) => {
    setQualifications({ ...qualifications, [qualification]: !qualifications[qualification as keyof typeof qualifications] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション
    if (!formData.name || !formData.nameKana || !formData.specialty) {
      alert('必須項目を入力してください');
      return;
    }

    // ここで実際の登録処理を行う
    alert('社員を登録しました');
    router.push('/settings');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">新規社員登録</h2>
            <Link href="/settings" className="text-blue-600 hover:underline">
              ← キャンセル
            </Link>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* 基本情報 */}
            <div className="bg-white rounded shadow mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold">基本情報</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      氏名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="例：山田 太郎"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      フリガナ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nameKana"
                      value={formData.nameKana}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="例：ヤマダ タロウ"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">社員番号</label>
                    <input
                      type="text"
                      name="employeeNumber"
                      value={formData.employeeNumber}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="例：E-0001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">入社年月日</label>
                    <input
                      type="date"
                      name="hireDate"
                      value={formData.hireDate}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 専門分野・資格 */}
            <div className="bg-white rounded shadow mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold">専門分野・資格</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    専門分野 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">選択してください</option>
                    <option value="機械">機械</option>
                    <option value="電気">電気</option>
                    <option value="両方">両方</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">保有資格（複数選択可）</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={qualifications.firstClassElectrical}
                        onChange={() => handleQualificationChange('firstClassElectrical')}
                        className="mr-2"
                      />
                      <span>1級電気工事施工管理技士</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={qualifications.secondClassElectrical}
                        onChange={() => handleQualificationChange('secondClassElectrical')}
                        className="mr-2"
                      />
                      <span>2級電気工事施工管理技士</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={qualifications.firstClassPiping}
                        onChange={() => handleQualificationChange('firstClassPiping')}
                        className="mr-2"
                      />
                      <span>1級管工事施工管理技士</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={qualifications.secondClassPiping}
                        onChange={() => handleQualificationChange('secondClassPiping')}
                        className="mr-2"
                      />
                      <span>2級管工事施工管理技士</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={qualifications.firstTypeElectrical}
                        onChange={() => handleQualificationChange('firstTypeElectrical')}
                        className="mr-2"
                      />
                      <span>第一種電気工事士</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={qualifications.secondTypeElectrical}
                        onChange={() => handleQualificationChange('secondTypeElectrical')}
                        className="mr-2"
                      />
                      <span>第二種電気工事士</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={qualifications.other}
                        onChange={() => handleQualificationChange('other')}
                        className="mr-2"
                      />
                      <span>その他</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">その他資格（自由記入）</label>
                  <input
                    type="text"
                    name="otherQualifications"
                    value={formData.otherQualifications}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="例：消防設備士甲種第1類"
                  />
                </div>
              </div>
            </div>

            {/* 配置可能条件 */}
            <div className="bg-white rounded shadow mb-6">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold">配置可能条件</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">専任配置</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="exclusivePlacement"
                        value="possible"
                        checked={formData.exclusivePlacement === 'possible'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>可能</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="exclusivePlacement"
                        value="impossible"
                        checked={formData.exclusivePlacement === 'impossible'}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <span>不可（兼任のみ）</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">備考</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    placeholder="配置に関する特記事項があれば入力"
                  />
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="mt-6 flex justify-end space-x-4">
              <Link
                href="/settings"
                className="px-6 py-2 border rounded hover:bg-gray-50 inline-block"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                登録する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}