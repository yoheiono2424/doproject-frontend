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
  Camera,
  Plus,
  Trash2
} from 'lucide-react';
import {
  Qualification,
  getCategory1Options,
  getCategory2Options,
  getCategory3Options,
  getQualificationNameOptions,
  hasCategory3,
  isLicenseCategory,
  isCustomCategory
} from '@/app/lib/qualificationData';

export default function StaffEditPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const { canAccessEmployeeManagement } = usePermissions();
  const [activeTab, setActiveTab] = useState('basic');
  const staffId = params.id as string;

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

  // 資格の複数管理
  const [qualificationList, setQualificationList] = useState<Qualification[]>([]);

  // 基本情報・連絡先情報
  const [formData, setFormData] = useState({
    // 1. 個人の基本情報
    name: '',
    nameKana: '',
    employeeNumber: '',
    birthDate: '',
    gender: '',
    jobTitle: '', // 組織上の役職（役員、部長、課長等）
    employeeType: '', // 正社員・契約・派遣など
    department: '',
    hasAdminPermission: false, // 個別権限（管理者権限）
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
    deploymentType: '', // 配置予定種別（監理技術者、主任技術者等）
    mainDuties: '', // 主な担当業務
    exclusiveStatus: '', // 専任・非専任
    otherQualifications: '',
    qualificationExpiry: '', // 資格有効期限
    trainingHistory: '', // 技能講習・特別教育受講履歴
    driverLicenseExpiry: '', // 自動車免許有効期限

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
    socialInsuranceNumber: '', // 社会保険番号
    pensionFundNumber: '', // 厚生年金基金番号

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
  const [licenseImages, setLicenseImages] = useState<(File | null)[]>([null, null]);
  const [licensePreviews, setLicensePreviews] = useState<string[]>(['', '']);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 認証チェック
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // 既存データの読み込み
  useEffect(() => {
    if (isAuthenticated && staffId) {
      const employee = mockStaff.find(emp => emp.id === staffId);
      if (employee) {
        // 基本情報をformDataにセット（TODO: 実際のデータ構造に合わせて調整）
        setFormData(prev => ({
          ...prev,
          name: employee.name || '',
          employeeNumber: employee.employeeId || '',
          jobTitle: employee.jobTitle || '',
          department: employee.department || '',
          companyPhone: employee.companyPhone || '',
          companyEmail: employee.companyEmail || '',
          specialty: employee.specialty || '',
          // hasAdminPermission: employee.hasAdminPermission || false, // TODO: mockDataに追加後有効化
        }));
      } else {
        // 従業員が見つからない場合は一覧に戻る
        alert('従業員が見つかりません');
        router.push('/staff');
      }
    }
  }, [isAuthenticated, staffId, router]);

  if (!isAuthenticated) {
    return null;
  }

  // 権限チェック：高権限ユーザー以外はアクセス不可
  if (!canAccessEmployeeManagement()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="content-area">
          <div className="bg-white shadow">
            <div className="p-4 border-b">
              <h2 className="text-2xl font-bold">社員情報編集</h2>
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

    // 基本情報タブの必須項目（顔写真、個別権限、退職日以外）
    if (!formData.name.trim()) errors.name = '氏名は必須です';
    if (!formData.nameKana.trim()) errors.nameKana = 'フリガナは必須です';
    if (!formData.birthDate) errors.birthDate = '生年月日は必須です';
    if (!formData.gender) errors.gender = '性別は必須です';
    if (!formData.employeeNumber.trim()) errors.employeeNumber = '社員番号は必須です';
    if (!formData.jobTitle) errors.jobTitle = '役職は必須です';
    if (!formData.department.trim()) errors.department = '所属部署は必須です';
    if (!formData.employeeType) errors.employeeType = '社員区分は必須です';
    if (!formData.hireDate) errors.hireDate = '入社日は必須です';

    return errors;
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

  const handleLicenseImageChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...licenseImages];
      newImages[index] = file;
      setLicenseImages(newImages);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...licensePreviews];
        newPreviews[index] = reader.result as string;
        setLicensePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLicenseImage = (index: number) => {
    const newImages = [...licenseImages];
    newImages[index] = null;
    setLicenseImages(newImages);

    const newPreviews = [...licensePreviews];
    newPreviews[index] = '';
    setLicensePreviews(newPreviews);
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

  // 資格の追加
  const addQualification = () => {
    const newQualification: Qualification = {
      id: Date.now().toString(),
      category1: '',
      category2: '',
      qualificationName: '',
      qualificationDetail: '',
      acquisitionDate: '',
      expiryDate: '',
      customName: ''
    };
    setQualificationList([...qualificationList, newQualification]);
  };

  // 資格の削除
  const removeQualification = (id: string) => {
    setQualificationList(qualificationList.filter(q => q.id !== id));
  };

  // 資格の更新
  const updateQualification = (id: string, field: keyof Qualification, value: string) => {
    setQualificationList(qualificationList.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  // 第1階層変更時の処理（第2階層以降をリセット）
  const handleCategory1Change = (id: string, value: string) => {
    setQualificationList(qualificationList.map(q =>
      q.id === id
        ? {
            ...q,
            category1: value,
            category2: '',
            qualificationName: '',
            qualificationDetail: '',
            customName: '',
            expiryDate: isLicenseCategory(value) ? q.expiryDate : '' // 免許以外は終了日をクリア
          }
        : q
    ));
  };

  // 第2階層変更時の処理（第3階層をリセット）
  const handleCategory2Change = (id: string, value: string) => {
    const qual = qualificationList.find(q => q.id === id);
    if (!qual) return;

    setQualificationList(qualificationList.map(q =>
      q.id === id
        ? {
            ...q,
            category2: value,
            qualificationName: '',
            qualificationDetail: ''
          }
        : q
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

      // エラーがあるタブに自動で切り替え（基本情報タブ）
      setActiveTab('basic');

      alert('必須項目を入力してください');
      return;
    }

    // ここで実際の更新処理を行う
    console.log('更新データ:', { formData, qualifications, careers, profileImage, licenseImages });
    alert('社員情報を更新しました');
    router.push(`/staff/${staffId}`);
  };

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
            <h2 className="text-2xl font-bold">社員情報編集</h2>
            <Link href={`/staff/${staffId}`} className="text-blue-600 hover:underline">
              ← キャンセル
            </Link>
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
                          <label className="block text-sm font-medium mb-1">
                            生年月日 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            性別 <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            required
                          >
                            <option value="">選択してください</option>
                            <option value="男性">男性</option>
                            <option value="女性">女性</option>
                            <option value="その他">その他</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          社員番号／ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="employeeNumber"
                          value={formData.employeeNumber}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          placeholder="例：E-0001"
                          required
                        />
                      </div>

                      {/* 顔写真アップロード */}
                      <div>
                        <label className="block text-sm font-medium mb-1">顔写真</label>
                        <div className="flex items-center space-x-4">
                          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                            {imagePreview ? (
                              <Image src={imagePreview} alt="プレビュー" width={96} height={96} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <Camera size={32} className="text-gray-400" />
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

                    {/* 右列：雇用情報 */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg border-b pb-2">雇用情報</h3>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          役職 <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          required
                        >
                          <option value="">選択してください</option>
                          <option value="役員">役員</option>
                          <option value="部長">部長</option>
                          <option value="課長">課長</option>
                          <option value="課長補佐">課長補佐</option>
                          <option value="係長">係長</option>
                          <option value="主任">主任</option>
                          <option value="メンバー">メンバー</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          所属部署 <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full border rounded px-3 py-2"
                          required
                        >
                          <option value="">選択してください</option>
                          <option value="技術部1課">技術部1課</option>
                          <option value="技術部2課">技術部2課</option>
                          <option value="営業部">営業部</option>
                          <option value="総務部">総務部</option>
                          <option value="役員">役員</option>
                        </select>
                      </div>

                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="hasAdminPermission"
                            checked={formData.hasAdminPermission}
                            onChange={(e) => setFormData({ ...formData, hasAdminPermission: e.target.checked })}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm font-medium">
                            個別権限
                            <span className="text-xs font-normal text-gray-500 ml-2">
                              （この従業員に管理者権限を付与する）
                            </span>
                          </span>
                        </label>
                      </div>

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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            入社日 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="hireDate"
                            value={formData.hireDate}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            required
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
                      <h3 className="font-bold text-lg border-b pb-2 mb-4">配置・担当業務</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">配置予定種別</label>
                          <select
                            name="deploymentType"
                            value={formData.deploymentType}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="">選択してください</option>
                            <option value="監理技術者">監理技術者</option>
                            <option value="主任技術者">主任技術者</option>
                            <option value="現場代理人">現場代理人</option>
                            <option value="現場担当">現場担当</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">専任・非専任</label>
                          <select
                            name="exclusiveStatus"
                            value={formData.exclusiveStatus}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="">選択してください</option>
                            <option value="専任">専任</option>
                            <option value="非専任">非専任</option>
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

                    {/* 専門分野・資格 */}
                    <div>
                      <h3 className="font-bold text-lg border-b pb-2 mb-4">専門分野・資格</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            得意分野／専門工種
                          </label>
                          <select
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="">選択してください</option>
                            <option value="機械">機械</option>
                            <option value="電気">電気</option>
                            <option value="鋼造">鋼造</option>
                            <option value="通信">通信</option>
                            <option value="納品">納品</option>
                            <option value="その他">その他</option>
                          </select>
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

                      {/* 資格管理（階層的プルダウン方式） */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium">保有資格</label>
                          <button
                            type="button"
                            onClick={addQualification}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            <Plus size={16} />
                            資格を追加
                          </button>
                        </div>

                        {qualificationList.length === 0 && (
                          <div className="text-center py-8 bg-gray-50 rounded border border-dashed border-gray-300">
                            <Award size={48} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500">「資格を追加」ボタンをクリックして資格を登録してください</p>
                          </div>
                        )}

                        <div className="space-y-4">
                          {qualificationList.map((qual, index) => (
                            <div key={qual.id} className="border rounded-lg p-4 bg-gray-50">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-gray-700">資格 {index + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeQualification(qual.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 size={16} />
                                  削除
                                </button>
                              </div>

                              <div className="space-y-3">
                                {/* 第1階層：大カテゴリ */}
                                <div>
                                  <label className="block text-sm font-medium mb-1">カテゴリ <span className="text-red-500">*</span></label>
                                  <select
                                    value={qual.category1}
                                    onChange={(e) => handleCategory1Change(qual.id, e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                  >
                                    <option value="">選択してください</option>
                                    {getCategory1Options().map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* 第2階層：中カテゴリ（第1階層選択後に表示） */}
                                {qual.category1 && !isCustomCategory(qual.category1) && (
                                  <div>
                                    <label className="block text-sm font-medium mb-1">種別 <span className="text-red-500">*</span></label>
                                    <select
                                      value={qual.category2}
                                      onChange={(e) => handleCategory2Change(qual.id, e.target.value)}
                                      className="w-full border rounded px-3 py-2"
                                    >
                                      <option value="">選択してください</option>
                                      {getCategory2Options(qual.category1).map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {/* 第3階層：資格名・詳細（必要な場合のみ表示） */}
                                {qual.category1 && qual.category2 && hasCategory3(qual.category1, qual.category2) ? (
                                  <div>
                                    <label className="block text-sm font-medium mb-1">詳細 <span className="text-red-500">*</span></label>
                                    <select
                                      value={qual.qualificationDetail}
                                      onChange={(e) => updateQualification(qual.id, 'qualificationDetail', e.target.value)}
                                      className="w-full border rounded px-3 py-2"
                                    >
                                      <option value="">選択してください</option>
                                      {getCategory3Options(qual.category1, qual.category2).map((option) => (
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  qual.category1 && qual.category2 && (
                                    <div>
                                      <label className="block text-sm font-medium mb-1">資格名 <span className="text-red-500">*</span></label>
                                      <select
                                        value={qual.qualificationName}
                                        onChange={(e) => updateQualification(qual.id, 'qualificationName', e.target.value)}
                                        className="w-full border rounded px-3 py-2"
                                      >
                                        <option value="">選択してください</option>
                                        {getQualificationNameOptions(qual.category1, qual.category2).map((option) => (
                                          <option key={option} value={option}>
                                            {option}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )
                                )}

                                {/* 自由入力資格名（その他（自由入力）選択時のみ） */}
                                {isCustomCategory(qual.category1) && (
                                  <div>
                                    <label className="block text-sm font-medium mb-1">資格名 <span className="text-red-500">*</span></label>
                                    <input
                                      type="text"
                                      value={qual.customName || ''}
                                      onChange={(e) => updateQualification(qual.id, 'customName', e.target.value)}
                                      className="w-full border rounded px-3 py-2"
                                      placeholder="資格名を入力してください"
                                    />
                                  </div>
                                )}

                                {/* 取得日（全カテゴリ必須） */}
                                <div>
                                  <label className="block text-sm font-medium mb-1">取得日 <span className="text-red-500">*</span></label>
                                  <input
                                    type="date"
                                    value={qual.acquisitionDate}
                                    onChange={(e) => updateQualification(qual.id, 'acquisitionDate', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                  />
                                </div>

                                {/* 終了日（免許カテゴリのみ表示・必須） */}
                                {isLicenseCategory(qual.category1) && (
                                  <div>
                                    <label className="block text-sm font-medium mb-1">有効期限 <span className="text-red-500">*</span></label>
                                    <input
                                      type="date"
                                      value={qual.expiryDate || ''}
                                      onChange={(e) => updateQualification(qual.id, 'expiryDate', e.target.value)}
                                      className="w-full border rounded px-3 py-2"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">※ 有効期限の1ヶ月前にアラートが表示されます</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 自動車運転免許証 */}
                    <div>
                      <h3 className="font-bold text-lg border-b pb-2 mb-4">自動車運転免許証</h3>

                      {/* 免許証の写真 */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">免許証の写真（表面・裏面）</label>
                        <div className="grid grid-cols-2 gap-4">
                          {[0, 1].map((index) => (
                            <div key={index} className="space-y-2">
                              <div className="text-sm font-medium text-gray-700">
                                {index === 0 ? '表面' : '裏面'}
                              </div>
                              <div className="relative">
                                <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                  {licensePreviews[index] ? (
                                    <>
                                      <Image
                                        src={licensePreviews[index]}
                                        alt={`免許証${index === 0 ? '表面' : '裏面'}`}
                                        width={256}
                                        height={160}
                                        className="w-full h-full object-contain rounded-lg"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeLicenseImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                        title="削除"
                                      >
                                        ×
                                      </button>
                                    </>
                                  ) : (
                                    <Camera size={40} className="text-gray-400" />
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLicenseImageChange(index)}
                                  className="hidden"
                                  id={`licenseImage${index}`}
                                />
                                <label
                                  htmlFor={`licenseImage${index}`}
                                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors inline-block mt-2 w-full text-center"
                                >
                                  {licensePreviews[index] ? '画像を変更' : '画像を選択'}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG (各最大5MB)</p>
                      </div>

                      {/* 有効期限 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">有効期限</label>
                          <input
                            type="date"
                            name="driverLicenseExpiry"
                            value={formData.driverLicenseExpiry}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">※ 免許証に記載の有効期限を入力してください</p>
                        </div>
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
                                  <label className="block text-xs font-medium mb-1">業務実績</label>
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
                          <label className="block text-sm font-medium mb-1">
                            CPD登録番号 <span className="text-xs font-normal text-gray-500">（継続能力開発）</span>
                          </label>
                          <input
                            type="text"
                            name="cpdNumber"
                            value={formData.cpdNumber}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="CPD番号を入力"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            CPDS登録番号 <span className="text-xs font-normal text-gray-500">（全国土木施工管理技士会）</span>
                          </label>
                          <input
                            type="text"
                            name="cpdsNumber"
                            value={formData.cpdsNumber}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="CPDS番号を入力"
                          />
                        </div>
                      </div>

                      {/* 社会保険・年金 */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div>
                          <label className="block text-sm font-medium mb-1">社会保険番号</label>
                          <input
                            type="text"
                            name="socialInsuranceNumber"
                            value={formData.socialInsuranceNumber}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：12345678"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">厚生年金基金番号</label>
                          <input
                            type="text"
                            name="pensionFundNumber"
                            value={formData.pensionFundNumber}
                            onChange={handleInputChange}
                            className="w-full border rounded px-3 py-2"
                            placeholder="例：1234-567890"
                          />
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
                href={`/staff/${staffId}`}
                className="px-6 py-2 border rounded hover:bg-gray-50 inline-block"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                更新する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
