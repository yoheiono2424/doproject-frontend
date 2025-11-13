'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { Building2, ArrowLeft, Upload } from 'lucide-react';

export default function NewPartnerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    companyNameKana: '',
    representative: '',
    contactName: '',
    address: '',
    phone: '',
    contactPhone: '',
    email: '',
    notes: '',
    displayColor: '', // 工程表表示色（任意）
  });

  // プリセット色（10色）
  const presetColors = [
    { name: '赤色', hex: '#DC2626', textClass: 'text-red-600' },
    { name: 'オレンジ色', hex: '#EA580C', textClass: 'text-orange-600' },
    { name: '黄色', hex: '#CA8A04', textClass: 'text-yellow-600' },
    { name: '緑色', hex: '#16A34A', textClass: 'text-green-600' },
    { name: '青緑色', hex: '#0891B2', textClass: 'text-cyan-600' },
    { name: '青色', hex: '#2563EB', textClass: 'text-blue-600' },
    { name: '紫色', hex: '#9333EA', textClass: 'text-purple-600' },
    { name: 'ピンク色', hex: '#DB2777', textClass: 'text-pink-600' },
    { name: '茶色', hex: '#92400E', textClass: 'text-amber-800' },
    { name: 'グレー', hex: '#4B5563', textClass: 'text-gray-600' },
  ];

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [files, setFiles] = useState<File[]>([]);

  // バリデーション
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = '会社名は必須です';
    }
    if (!formData.companyNameKana.trim()) {
      newErrors.companyNameKana = 'フリガナは必須です';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '電話番号は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 入力変更ハンドラー
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // エラーをクリア
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ファイルアップロードハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // ファイル削除ハンドラー
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 登録処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // TODO: 実際のデータベース登録処理
    console.log('協力会社登録:', formData);
    console.log('アップロードファイル:', files);

    alert('協力会社を登録しました');
    router.push('/partners');
  };

  const isFormValid = formData.companyName && formData.companyNameKana && formData.phone;

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
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 size={32} />
          協力会社 新規登録
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* 会社情報 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">会社情報</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* 会社名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="株式会社〇〇"
              />
              {errors.companyName && (
                <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
              )}
            </div>

            {/* フリガナ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                フリガナ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyNameKana"
                value={formData.companyNameKana}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  errors.companyNameKana ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="カブシキガイシャマルマル"
              />
              {errors.companyNameKana && (
                <p className="text-red-500 text-sm mt-1">{errors.companyNameKana}</p>
              )}
            </div>

            {/* 代表者名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">代表者名</label>
              <input
                type="text"
                name="representative"
                value={formData.representative}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="山田太郎"
              />
            </div>

            {/* 会社の電話番号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                会社の電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="03-1234-5678"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* 所在地 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">所在地</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="東京都千代田区〇〇1-1-1"
              />
            </div>

            {/* 備考 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="特記事項があれば記載してください"
              />
            </div>

            {/* 工程表表示色 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                工程表表示色（任意）
              </label>
              <p className="text-xs text-gray-500 mb-2">
                工程表で協力会社名を表示する際の色を選択できます。未設定の場合はグレーで表示されます。
              </p>
              <div className="flex items-center gap-3">
                {/* 色見本 */}
                <div
                  className="w-10 h-10 border-2 border-gray-300 rounded flex-shrink-0"
                  style={{ backgroundColor: formData.displayColor || '#6B7280' }}
                  title={formData.displayColor ? '選択中の色' : '未設定（グレー）'}
                />
                {/* プルダウン */}
                <select
                  name="displayColor"
                  value={formData.displayColor}
                  onChange={handleChange}
                  className="flex-1 p-2 border border-gray-300 rounded"
                >
                  <option value="">未設定（グレー）</option>
                  {presetColors.map((color) => (
                    <option key={color.hex} value={color.hex}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 担当者情報 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">担当者情報</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* 担当者名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="佐藤一郎"
              />
            </div>

            {/* 担当者の電話番号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">担当者の電話番号</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="090-1234-5678"
              />
            </div>

            {/* 担当者のメールアドレス */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">担当者のメールアドレス</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="tanaka@example.com"
              />
            </div>
          </div>
        </div>

        {/* 書類アップロード */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">書類アップロード</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              書類ファイル（PDF、Excel等）
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto mb-2 text-gray-400" size={40} />
              <input
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-800"
              >
                ファイルを選択
              </label>
              <p className="text-sm text-gray-500 mt-1">または、ファイルをドラッグ&ドロップ</p>
            </div>
          </div>

          {/* アップロード済みファイル一覧 */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">選択中のファイル:</p>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded"
                >
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ボタン */}
        <div className="flex gap-4 justify-end">
          <Link href="/partners">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              キャンセル
            </button>
          </Link>
          <button
            type="submit"
            disabled={!isFormValid}
            className={`px-6 py-2 rounded text-white ${
              isFormValid
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            登録する
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
