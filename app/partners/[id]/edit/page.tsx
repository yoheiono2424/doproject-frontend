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
    address: partner?.address || '',
    phone: partner?.phone || '',
    email: partner?.email || '',
    notes: partner?.notes || '',
  });

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        {/* 基本情報 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">基本情報</h2>
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
              />
            </div>

            {/* 電話番号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
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
              />
            </div>

            {/* メールアドレス */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
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
              />
            </div>
          </div>
        </div>

        {/* 書類管理 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">書類管理</h2>

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
