'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockStaff } from '@/app/lib/mockData';
import { usePermissions } from '@/app/lib/usePermissions';
import {
  User,
  Phone,
  Award,
  Heart,
  Settings,
  Camera
} from 'lucide-react';

export default function StaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const { canAccessEmployeeManagement } = usePermissions();
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  // 従業員データを取得
  const staffId = params.id as string;
  const employee = mockStaff.find(emp => emp.id === staffId);

  // 権限チェック：高権限ユーザー以外はアクセス不可
  if (!canAccessEmployeeManagement()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="content-area">
          <div className="bg-white shadow">
            <div className="p-4 border-b">
              <h2 className="text-2xl font-bold">従業員詳細</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-white rounded shadow p-6 text-center">
              <p className="text-red-600 text-lg font-bold mb-4">アクセス権限がありません</p>
              <p className="text-gray-600 mb-6">この機能は部長クラス以上、総務部、または個別権限を持つユーザーのみ利用できます。</p>
              <Link href="/dashboard" className="text-blue-600 hover:underline">
                ← ダッシュボードに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="content-area">
          <div className="bg-white shadow">
            <div className="p-4 border-b">
              <h2 className="text-2xl font-bold">従業員詳細</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-white rounded shadow p-6 text-center">
              <p className="text-gray-600">従業員が見つかりません。</p>
              <Link href="/staff" className="text-blue-600 hover:underline mt-4 inline-block">
                ← 従業員一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'basic', label: '基本情報', icon: User },
    { id: 'contact', label: '連絡先', icon: Phone },
    { id: 'qualification', label: '資格・スキル', icon: Award },
    { id: 'health', label: '健康・安全', icon: Heart },
    { id: 'system', label: 'システム', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/staff" className="text-blue-600 hover:underline">
                ← 戻る
              </Link>
              <h2 className="text-2xl font-bold">従業員詳細 - {employee.name}</h2>
            </div>
            <button
              onClick={() => router.push(`/staff/${staffId}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              編集
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* タブナビゲーション */}
          <div className="bg-white rounded-t-lg shadow">
            <div className="flex border-b">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="bg-white rounded-b-lg shadow">
            {/* 基本情報タブ */}
            {activeTab === 'basic' && (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* 左列：個人情報 */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">個人情報</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">氏名（漢字）</label>
                        <div className="text-base">{employee.name || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">フリガナ</label>
                        <div className="text-base">-</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">生年月日</label>
                        <div className="text-base">-</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">性別</label>
                        <div className="text-base">-</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">社員番号／ID</label>
                      <div className="text-base">{employee.employeeId || '-'}</div>
                    </div>

                    {/* 個別権限 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">個別権限</label>
                      <div className="text-base">
                        {employee.hasAdminPermission ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            管理者権限あり
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                            権限なし
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 顔写真 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">顔写真</label>
                      <div className="w-24 h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <Camera size={32} className="text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* 右列：雇用情報 */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">雇用情報</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">役職</label>
                      <div className="text-base">{employee.jobTitle || '-'}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">所属部署</label>
                      <div className="text-base">{employee.department || '-'}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">社員区分</label>
                      <div className="text-base">-</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">入社日</label>
                        <div className="text-base">-</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">退職日</label>
                        <div className="text-base">-</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 連絡先タブ */}
            {activeTab === 'contact' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">住所情報</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">自宅住所</label>
                      <div className="text-base">-</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">連絡先情報</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">携帯電話</label>
                        <div className="text-base">-</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">社用携帯番号</label>
                        <div className="text-base">{employee.companyPhone || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">社内メールアドレス</label>
                        <div className="text-base">{employee.companyEmail || '-'}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">緊急連絡先</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">緊急連絡先（電話番号）</label>
                        <div className="text-base">-</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">続柄</label>
                        <div className="text-base">-</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 資格・スキルタブ */}
            {activeTab === 'qualification' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">配置・担当業務</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">配置予定種別</label>
                        <div className="text-base">-</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">専任・非専任</label>
                        <div className="text-base">-</div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">主な担当業務</label>
                        <div className="text-base">-</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">専門分野・資格</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">得意分野／専門工種</label>
                        <div className="text-base">{employee.specialty || '-'}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">施工経験年数</label>
                        <div className="text-base">-</div>
                      </div>
                    </div>

                    {/* 資格管理（階層的表示） */}
                    <div>
                      <h3 className="font-bold text-lg border-b pb-2 mb-4">保有資格</h3>

                      {/* 資格データが存在しない場合 */}
                      {(!employee.qualifications || employee.qualifications.length === 0) && (
                        <div className="text-center py-8 bg-gray-50 rounded border border-dashed border-gray-300">
                          <Award size={48} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500">登録されている資格はありません</p>
                        </div>
                      )}

                      {/* 資格データが存在する場合 */}
                      {employee.qualifications && employee.qualifications.length > 0 && (
                        <div className="space-y-4">
                          {employee.qualifications.map((qual: any, index: number) => {
                            // 資格名の表示ロジック
                            let displayName = '';
                            if (qual.customName) {
                              displayName = qual.customName;
                            } else if (qual.qualificationDetail) {
                              displayName = `${qual.category2} - ${qual.qualificationDetail}`;
                            } else if (qual.qualificationName) {
                              displayName = qual.qualificationName;
                            } else {
                              displayName = qual.category2 || '-';
                            }

                            // 期限切れ間近かどうかをチェック（免許カテゴリのみ）
                            const isLicense = qual.category1 === '免許';
                            let isExpiringSoon = false;
                            let daysRemaining = 0;

                            if (isLicense && qual.expiryDate) {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const expiryDate = new Date(qual.expiryDate);
                              expiryDate.setHours(0, 0, 0, 0);
                              const oneMonthFromToday = new Date(today);
                              oneMonthFromToday.setDate(oneMonthFromToday.getDate() + 30);

                              if (expiryDate <= oneMonthFromToday && expiryDate >= today) {
                                isExpiringSoon = true;
                                daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              }
                            }

                            return (
                              <div
                                key={index}
                                className={`border rounded-lg p-4 ${isExpiringSoon ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50'}`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                                        {qual.category1}
                                      </span>
                                      {isExpiringSoon && (
                                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-500 text-white flex items-center gap-1">
                                          ⚠️ 期限間近（残り{daysRemaining}日）
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-bold text-lg text-gray-800">{displayName}</h4>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">取得日：</span>
                                    <span className="font-medium">{qual.acquisitionDate || '-'}</span>
                                  </div>
                                  {isLicense && qual.expiryDate && (
                                    <div>
                                      <span className="text-gray-600">有効期限：</span>
                                      <span className={`font-medium ${isExpiringSoon ? 'text-yellow-700' : ''}`}>
                                        {qual.expiryDate}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 自動車運転免許証 */}
                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">自動車運転免許証</h3>

                    {/* 免許証の写真 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-600 mb-2">免許証の写真（表面・裏面）</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[0, 1].map((index) => (
                          <div key={index} className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">
                              {index === 0 ? '表面' : '裏面'}
                            </div>
                            <div className="w-full h-40 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                              <Camera size={40} className="text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 有効期限 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">有効期限</label>
                        <div className="text-base">-</div>
                      </div>
                    </div>
                  </div>

                  {/* 備考 */}
                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">備考</h3>
                    <div className="text-base">-</div>
                  </div>
                </div>
              </div>
            )}

            {/* 健康・安全タブ */}
            {activeTab === 'health' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">健康管理</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">健康診断受診日</label>
                        <div className="text-base">-</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">血圧結果</label>
                        <div className="text-base">-</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* システムタブ */}
            {activeTab === 'system' && (
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">システム利用情報</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">ログインID</label>
                        <div className="text-base">-</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">権限レベル</label>
                        <div className="text-base">-</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">その他情報</h3>

                    {/* 建設キャリア */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-600 mb-2">建設キャリア</label>
                      <div className="text-base text-gray-500">登録されていません</div>
                    </div>

                    {/* CPD/CPDS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          CPD登録番号 <span className="text-xs font-normal text-gray-500">（継続能力開発）</span>
                        </label>
                        <div className="text-base">-</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          CPDS登録番号 <span className="text-xs font-normal text-gray-500">（全国土木施工管理技士会）</span>
                        </label>
                        <div className="text-base">-</div>
                      </div>
                    </div>

                    {/* 社会保険・年金 */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">社会保険番号</label>
                        <div className="text-base">-</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">厚生年金基金番号</label>
                        <div className="text-base">-</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
