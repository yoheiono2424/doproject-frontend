'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';

export default function StaffRegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState('basic');

  // 建設キャリアの型定義
  type Career = {
    id: string;
    company: string;
    description: string;
    startDate: string;
    endDate: string;
  };

  // 建設キャリアの複数管理
  const [careers, setCareers] = useState<Career[]>([
    {
      id: '1',
      company: '',
      description: '',
      startDate: '',
      endDate: ''
    }
  ]);

  // 基本情報・連絡先情報
  const [formData, setFormData] = useState({
    // 1. 個人の基本情報
    name: '',
    nameKana: '',
    employeeNumber: '',
    birthDate: '',
    gender: '',
    employeeType: '', // 正社員・契約・派遣など
    department: '',
    hireDate: '',
    retirementDate: '',

    // 2. 連絡・住所情報
    homeAddress: '',
    personalPhone: '',
    emergencyContact: '',
    emergencyContactRelation: '',
    companyPhone: '',
    companyEmail: '',

    // 3. 役職・資格関連
    position: '', // 職種・役職
    mainDuties: '', // 主な担当業務
    workType: '', // 勤務形態
    otherQualifications: '',
    qualificationExpiry: '', // 資格有効期限
    trainingHistory: '', // 技能講習・特別教育受講履歴

    // 4. 案件・工程管理スキル
    specialty: '', // 得意分野／専門工種
    experienceYears: '', // 施工経験年数

    // 5. 安全・健康関連
    healthCheckDate: '',
    bloodPressure: '',

    // 6. システム運用・その他
    loginId: '',
    permissionLevel: '',
    // その他の情報（建設キャリアをcareers配列に移動）
    cpdNumber: '', // CPD登録番号
    cpdsNumber: '', // CPDS登録番号

    // 備考
    remarks: '',
  });

  const [qualifications, setQualifications] = useState({
    firstClassElectrical: false,
    secondClassElectrical: false,
    firstClassPiping: false,
    secondClassPiping: false,
    firstTypeElectrical: false,
    secondTypeElectrical: false,
    safetyOfficer: false, // 安全衛生責任者
    other: false,
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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

    // エラーをクリア
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 必須項目のチェック
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // 基本情報の必須項目
    if (!formData.name.trim()) errors.name = '氏名は必須です';
    if (!formData.nameKana.trim()) errors.nameKana = 'フリガナは必須です';
    if (!formData.employeeType) errors.employeeType = '社員区分は必須です';
    if (!formData.department.trim()) errors.department = '所属部署は必須です';
    if (!formData.specialty) errors.specialty = '専門分野は必須です';

    return errors;
  };

  // フォームが有効かチェック
  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.nameKana.trim() !== '' &&
      formData.employeeType !== '' &&
      formData.department.trim() !== '' &&
      formData.specialty !== ''
    );
  };

  const handleQualificationChange = (qualification: string) => {
    setQualifications({ ...qualifications, [qualification]: !qualifications[qualification as keyof typeof qualifications] });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // キャリアの追加
  const addCareer = () => {
    const newCareer: Career = {
      id: Date.now().toString(),
      company: '',
      description: '',
      startDate: '',
      endDate: ''
    };
    setCareers([...careers, newCareer]);
  };

  // キャリアの削除
  const removeCareer = (id: string) => {
    if (careers.length > 1) {
      setCareers(careers.filter(career => career.id !== id));
    }
  };

  // キャリアの更新
  const updateCareer = (id: string, field: keyof Career, value: string) => {
    setCareers(careers.map(career =>
      career.id === id ? { ...career, [field]: value } : career
    ));
  };

  // 勤務期間の計算
  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth() + (years * 12);
    const displayYears = Math.floor(months / 12);
    const displayMonths = months % 12;
    if (displayYears > 0 && displayMonths > 0) {
      return `${displayYears}年${displayMonths}ヶ月`;
    } else if (displayYears > 0) {
      return `${displayYears}年`;
    } else if (displayMonths > 0) {
      return `${displayMonths}ヶ月`;
    } else {
      return '1ヶ月未満';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーション実行
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);

      // 最初のエラーがあるタブに自動で切り替え
      if (errors.name || errors.nameKana || errors.employeeType || errors.department) {
        setActiveTab('basic');
      } else if (errors.specialty) {
        setActiveTab('qualification');
      }

      alert('必須項目を入力してください');
      return;
    }

    // ここで実際の登録処理を行う
    console.log('登録データ:', { formData, qualifications, careers, profileImage });
    alert('社員を登録しました');
    router.push('/settings');
  };

  const tabs = [
    { id: 'basic', label: '基本情報', icon: '👤' },
    { id: 'contact', label: '連絡先', icon: '📞' },
    { id: 'qualification', label: '資格・スキル', icon: '📜' },
    { id: 'health', label: '健康・安全', icon: '🏥' },
    { id: 'system', label: 'システム', icon: '💻' },
  ];

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
          {/* タブナビゲーション */}
          <div className="bg-white rounded-t-lg shadow">
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
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
                          <label className="block text-sm font-medium mb-1">
                            氏名（漢字） <span className="text-red-500">*</span>
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
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">生年月日</label>
                          <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">性別</label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="">選択してください</option>
                            <option value="男性">男性</option>
                            <option value="女性">女性</option>
                            <option value="その他">その他</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">社員番号／ID</label>
                        <input
                          type="text"
                          name="employeeNumber"
                          value={formData.employeeNumber}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          placeholder="例：E-0001"
                        />
                      </div>
                    </div>

                    {/* 右列：雇用情報と写真 */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg border-b pb-2">雇用情報</h3>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          社員区分 <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="employeeType"
                          value={formData.employeeType}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          required
                        >
                          <option value="">選択してください</option>
                          <option value="正社員">正社員</option>
                          <option value="契約社員">契約社員</option>
                          <option value="派遣社員">派遣社員</option>
                          <option value="パート・アルバイト">パート・アルバイト</option>
                          <option value="その他">その他</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          所属部署 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          placeholder="例：工事部"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">入社日</label>
                          <input
                            type="date"
                            name="hireDate"
                            value={formData.hireDate}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">退職日</label>
                          <input
                            type="date"
                            name="retirementDate"
                            value={formData.retirementDate}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                      </div>

                      {/* 顔写真アップロード */}
                      <div>
                        <label className="block text-sm font-medium mb-1">顔写真</label>
                        <div className="flex items-center space-x-4">
                          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                            {imagePreview ? (
                              <img src={imagePreview} alt="プレビュー" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <span className="text-gray-400">📷</span>
                            )}
                          </div>
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                              id="profileImage"
                            />
                            <label
                              htmlFor="profileImage"
                              className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
                            >
                              画像を選択
                            </label>
                            <p className="text-xs text-gray-500 mt-1">JPG, PNG (最大2MB)</p>
                          </div>
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
                        <label className="block text-sm font-medium mb-1">自宅住所</label>
                        <input
                          type="text"
                          name="homeAddress"
                          value={formData.homeAddress}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          placeholder="例：東京都渋谷区○○ 1-2-3"
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg border-b pb-2 mb-4">連絡先情報</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">携帯電話</label>
                          <input
                            type="tel"
                            name="personalPhone"
                            value={formData.personalPhone}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：090-1234-5678"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">社用携帯番号</label>
                          <input
                            type="tel"
                            name="companyPhone"
                            value={formData.companyPhone}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：080-1234-5678"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">社内メールアドレス</label>
                          <input
                            type="email"
                            name="companyEmail"
                            value={formData.companyEmail}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：yamada@company.co.jp"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg border-b pb-2 mb-4">緊急連絡先</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">緊急連絡先（電話番号）</label>
                          <input
                            type="tel"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：03-1234-5678"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">続柄</label>
                          <input
                            type="text"
                            name="emergencyContactRelation"
                            value={formData.emergencyContactRelation}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：配偶者、実家など"
                          />
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
                      <h3 className="font-bold text-lg border-b pb-2 mb-4">役職・担当業務</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">職種・役職</label>
                          <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：主任技術者"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">勤務形態</label>
                          <select
                            name="workType"
                            value={formData.workType}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="">選択してください</option>
                            <option value="常勤">常勤</option>
                            <option value="非常勤">非常勤</option>
                            <option value="現場常駐">現場常駐</option>
                            <option value="その他">その他</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">主な担当業務</label>
                          <input
                            type="text"
                            name="mainDuties"
                            value={formData.mainDuties}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：土木、電気、施工管理など"
                          />
                        </div>
                      </div>
                    </div>

            {/* 専門分野・資格は既存のコードを移動 */}
                    <div>
                      <h3 className="font-bold text-lg border-b pb-2 mb-4">専門分野・資格</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            得意分野／専門工種 <span className="text-red-500">*</span>
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
                            <option value="鋼造">鋼造</option>
                            <option value="通信">通信</option>
                            <option value="納品">納品</option>
                            <option value="その他">その他</option>
                          </select>
                          {validationErrors.specialty && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.specialty}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">施工経験年数</label>
                          <input
                            type="number"
                            name="experienceYears"
                            value={formData.experienceYears}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：10"
                            min="0"
                          />
                        </div>
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
                        checked={qualifications.safetyOfficer}
                        onChange={() => handleQualificationChange('safetyOfficer')}
                        className="mr-2"
                      />
                      <span>安全衛生責任者</span>
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
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
                        <div>
                          <label className="block text-sm font-medium mb-1">資格有効期限・更新日</label>
                          <input
                            type="date"
                            name="qualificationExpiry"
                            value={formData.qualificationExpiry}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">技能講習・特別教育受講履歴</label>
                        <textarea
                          name="trainingHistory"
                          value={formData.trainingHistory}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          rows={3}
                          placeholder="例：足場の組立て等特別教育、高所作業車運転技能講習、玉掛け技能講習など"
                        />
                      </div>
                    </div>

                    {/* 備考 */}
                    <div>
                      <h3 className="font-bold text-lg border-b pb-2 mb-4">備考</h3>
                      <div>
                        <textarea
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          rows={4}
                          placeholder="特記事項があれば入力してください"
                        />
                      </div>
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
                          <label className="block text-sm font-medium mb-1">健康診断受診日</label>
                          <input
                            type="date"
                            name="healthCheckDate"
                            value={formData.healthCheckDate}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">血圧結果</label>
                          <input
                            type="text"
                            name="bloodPressure"
                            value={formData.bloodPressure}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：120/80"
                          />
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
                          <label className="block text-sm font-medium mb-1">ログインID</label>
                          <input
                            type="text"
                            name="loginId"
                            value={formData.loginId}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：yamada_t"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">権限レベル</label>
                          <select
                            name="permissionLevel"
                            value={formData.permissionLevel}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="">選択してください</option>
                            <option value="管理者">管理者</option>
                            <option value="一般">一般</option>
                            <option value="閲覧のみ">閲覧のみ</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg border-b pb-2 mb-4">その他情報</h3>

                      {/* 建設キャリア */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">建設キャリア</label>
                          <button
                            type="button"
                            onClick={addCareer}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            + キャリアを追加
                          </button>
                        </div>

                        <div className="space-y-4">
                          {careers.map((career, index) => (
                            <div key={career.id} className="p-4 bg-gray-50 rounded space-y-4 relative">
                              {careers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeCareer(career.id)}
                                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                  title="削除"
                                >
                                  ×
                                </button>
                              )}

                              <div className="text-xs font-medium text-gray-600 mb-2">
                                職歴 {index + 1}
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium mb-1">会社名</label>
                                  <input
                                    type="text"
                                    value={career.company}
                                    onChange={(e) => updateCareer(career.id, 'company', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    placeholder="例：〇〇建設株式会社"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">業務内容</label>
                                  <select
                                    value={career.description}
                                    onChange={(e) => updateCareer(career.id, 'description', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                  >
                                    <option value="">選択してください</option>
                                    <option value="土木施工管理">土木施工管理</option>
                                    <option value="電気工事施工管理">電気工事施工管理</option>
                                    <option value="機械設備施工">機械設備施工</option>
                                    <option value="管工事施工管理">管工事施工管理</option>
                                    <option value="造園工事">造園工事</option>
                                    <option value="建築施工管理">建築施工管理</option>
                                    <option value="現場監督">現場監督</option>
                                    <option value="設計・積算">設計・積算</option>
                                    <option value="その他">その他</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium mb-1">開始日</label>
                                  <input
                                    type="date"
                                    value={career.startDate}
                                    onChange={(e) => updateCareer(career.id, 'startDate', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1">終了日</label>
                                  <input
                                    type="date"
                                    value={career.endDate}
                                    onChange={(e) => updateCareer(career.id, 'endDate', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                  />
                                </div>
                              </div>

                              {/* 勤務年数の自動計算表示 */}
                              {career.startDate && career.endDate && (
                                <div className="text-sm text-gray-600">
                                  勤務期間：{calculateDuration(career.startDate, career.endDate)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-gray-500 mt-2">※ 職歴を古い順に記入してください</p>
                      </div>

                      {/* CPD/CPDS */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">CPD登録番号</label>
                          <input
                            type="text"
                            name="cpdNumber"
                            value={formData.cpdNumber}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="CPD番号を入力"
                          />
                          <p className="text-xs text-gray-500 mt-1">継続能力開発（CPD）の登録番号</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">CPDS登録番号</label>
                          <input
                            type="text"
                            name="cpdsNumber"
                            value={formData.cpdsNumber}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="CPDS番号を入力"
                          />
                          <p className="text-xs text-gray-500 mt-1">全国土木施工管理技士会の登録番号</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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