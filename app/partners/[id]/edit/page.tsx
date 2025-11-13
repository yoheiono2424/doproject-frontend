'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { mockPartners, mockPartnerDocuments } from '@/app/lib/mockData';
import { Building2, ArrowLeft, Upload, Trash2 } from 'lucide-react';

export default function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const partner = mockPartners.find((p) => p.id === resolvedParams.id);
  const existingDocuments = mockPartnerDocuments.filter((d) => d.partnerId === resolvedParams.id);

  const [formData, setFormData] = useState({
    companyName: partner?.companyName || '',
    companyNameKana: partner?.companyNameKana || '',
    representative: partner?.representative || '',
    contactName: '', // 協力会社データには存在しないため空文字列で初期化
    address: partner?.address || '',
    phone: partner?.phone || '',
    contactPhone: '', // 協力会社データには存在しないため空文字列で初期化
    email: partner?.email || '',
    notes: partner?.notes || '',
    displayColor: partner?.displayColor || '', // 工程表表示色（任意）
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
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // 新規ファイルアップロードハンドラー
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  // 新規ファイル削除ハンドラー
  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 既存書類削除マーク
  const handleMarkDocumentForDeletion = (docId: string) => {
    setDocumentsToDelete((prev) => [...prev, docId]);
  };

  // 既存書類削除解除
  const handleUnmarkDocumentForDeletion = (docId: string) => {
    setDocumentsToDelete((prev) => prev.filter((id) => id !== docId));
  };

  // 更新処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // TODO: 実際のデータベース更新処理
    console.log('協力会社更新:', formData);
    console.log('新規アップロードファイル:', newFiles);
    console.log('削除する書類:', documentsToDelete);

    alert('協力会社情報を更新しました');
    router.push(`/partners/${resolvedParams.id}`);
  };

  const isFormValid = formData.companyName && formData.companyNameKana && formData.phone;

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
        <Link href={`/partners/${resolvedParams.id}`}>
          <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4">
            <ArrowLeft size={20} />
            協力会社詳細に戻る
          </button>
        </Link>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 size={32} />
          協力会社 編集
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

          {/* 既存書類 */}
          {existingDocuments.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">登録済み書類</p>
              <div className="space-y-2">
                {existingDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between bg-gray-50 p-3 rounded ${
                      documentsToDelete.includes(doc.id) ? 'opacity-50 line-through' : ''
                    }`}
                  >
                    <div>
                      <span className="text-sm text-gray-700">{doc.fileName}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({formatFileSize(doc.fileSize)})
                      </span>
                    </div>
                    {documentsToDelete.includes(doc.id) ? (
                      <button
                        type="button"
                        onClick={() => handleUnmarkDocumentForDeletion(doc.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        削除を取り消す
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleMarkDocumentForDeletion(doc.id)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                      >
                        <Trash2 size={16} />
                        削除
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 新規書類アップロード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              書類を追加アップロード
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto mb-2 text-gray-400" size={40} />
              <input
                type="file"
                multiple
                accept=".pdf,.xlsx,.xls,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-edit"
              />
              <label
                htmlFor="file-upload-edit"
                className="cursor-pointer text-blue-600 hover:text-blue-800"
              >
                ファイルを選択
              </label>
            </div>
          </div>

          {/* 新規アップロードファイル一覧 */}
          {newFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">新規アップロード:</p>
              {newFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-blue-50 p-3 rounded"
                >
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(index)}
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
          <Link href={`/partners/${resolvedParams.id}`}>
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
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            更新する
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
