'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockProjects, mockPartners } from '@/app/lib/mockData';

type SortOrder = 'default' | 'desc';
type ViewMode = 'month' | 'day';

export default function SchedulePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [contractFilter, setContractFilter] = useState<string>('all');
  const [workTypeTab, setWorkTypeTab] = useState<string>('工事');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  // ユニークな値を取得するためのヘルパー関数
  const getUniqueManagers = () => {
    const managers = new Set(mockProjects.map(p => p.manager));
    return Array.from(managers).sort();
  };


  // データのフィルタリングとソート
  const getFilteredAndSortedProjects = () => {
    let filtered = [...mockProjects];

    // 工事種別でフィルタリング（タブ）
    filtered = filtered.filter(p => (p as any).workType === workTypeTab);

    // 担当者でフィルタリング
    if (managerFilter !== 'all') {
      filtered = filtered.filter(p => p.manager === managerFilter);
    }

    // 種別でフィルタリング
    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    // 元請/下請でフィルタリング
    if (contractFilter !== 'all') {
      filtered = filtered.filter(p => p.contractType === contractFilter);
    }

    // ソート
    if (sortOrder === 'desc') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB;
      });
    }

    return filtered;
  };

  const filteredProjects = getFilteredAndSortedProjects();

  // ソート順の切り替え（デフォルト ⇔ 新しい順）
  const toggleSort = () => {
    setSortOrder(sortOrder === 'default' ? 'desc' : 'default');
  };

  // 当月から18ヶ月分の月を生成
  const generateMonths = () => {
    const result = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed

    for (let i = 0; i < 18; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      const monthName = `${monthIndex + 1}月`;
      result.push({ monthName, month: monthIndex + 1, year });
    }
    return result;
  };

  const months = generateMonths();

  const handleMonthClick = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setViewMode('day');
  };

  const handleBackToMonthView = () => {
    setViewMode('month');
  };

  // 日別表示用の日数を生成（1-31）
  const generateDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const days = viewMode === 'day' ? generateDays() : [];

  const getGanttBarPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (viewMode === 'month') {
      // 月表示モード
      const today = new Date();
      const baseYear = today.getFullYear();
      const baseMonth = today.getMonth(); // 現在月を基準に

      // Calculate start position (in months from base)
      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      let startPosition = (startYear - baseYear) * 12 + startMonth - baseMonth;

      // Calculate duration in months
      const endYear = end.getFullYear();
      const endMonth = end.getMonth();
      let duration = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

      // 当月より前に開始する案件の場合、表示範囲を調整
      if (startPosition < 0) {
        duration = duration + startPosition; // 表示期間を調整
        startPosition = 0; // 当月から表示開始
      }

      // 18ヶ月を超える場合は表示範囲内に収める
      if (startPosition + duration > 18) {
        duration = 18 - startPosition;
      }

      // Convert to pixels (40px per cell)
      const left = startPosition * 40;
      const width = duration * 40;

      return { left, width, duration };
    } else {
      // 日別表示モード
      const startDay = start.getDate();
      const endDay = end.getDate();
      const startYearMonth = start.getFullYear() * 12 + start.getMonth();
      const endYearMonth = end.getFullYear() * 12 + end.getMonth();
      const selectedYearMonth = selectedYear * 12 + (selectedMonth - 1);

      // 選択された月の範囲内の日付のみ表示
      let displayStartDay = 1;
      let displayEndDay = new Date(selectedYear, selectedMonth, 0).getDate();

      if (startYearMonth === selectedYearMonth && endYearMonth === selectedYearMonth) {
        // 同じ月内で開始・終了
        displayStartDay = startDay;
        displayEndDay = endDay;
      } else if (startYearMonth === selectedYearMonth) {
        // この月に開始
        displayStartDay = startDay;
      } else if (endYearMonth === selectedYearMonth) {
        // この月に終了
        displayEndDay = endDay;
      } else if (startYearMonth > selectedYearMonth || endYearMonth < selectedYearMonth) {
        // この月に該当しない
        return { left: 0, width: 0, duration: 0 };
      }

      const left = (displayStartDay - 1) * 40;
      const width = (displayEndDay - displayStartDay + 1) * 40;
      const duration = displayEndDay - displayStartDay + 1;

      return { left, width, duration };
    }
  };

  const getPhaseInfo = (startDate: string, endDate: string, duration: number) => {
    // フェーズ分割の計算（工期を4フェーズに分ける）
    const phases = [];
    const quarterDuration = Math.ceil(duration / 4);

    phases.push({
      label: '契約',
      className: 'gantt-phase-contract',
      width: quarterDuration * 40,
      left: 0
    });

    phases.push({
      label: '着工準備',
      className: 'gantt-phase-preparation',
      width: quarterDuration * 40,
      left: quarterDuration * 40
    });

    phases.push({
      label: '施工',
      className: 'gantt-phase-construction',
      width: quarterDuration * 40,
      left: quarterDuration * 40 * 2
    });

    phases.push({
      label: '竣工',
      className: 'gantt-phase-completion',
      width: (duration - quarterDuration * 3) * 40,
      left: quarterDuration * 40 * 3
    });

    return phases;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-2xl font-bold">
                  {viewMode === 'month'
                    ? '諸物件人員配置計画（18ヶ月表示）'
                    : `諸物件人員配置計画（${selectedYear}年${selectedMonth}月 日別表示）`}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="px-3 py-1 bg-pink-100 text-pink-700 font-bold rounded">※ 着色物件はコリンズ対象</div>
                  <div className="text-sm text-purple-700 font-bold">※ ￥45,000千万円以上の物件は、専任の主任技術者を配置する事</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {viewMode === 'day' && (
                  <button
                    onClick={handleBackToMonthView}
                    className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200"
                  >
                    ← 18ヶ月表示に戻る
                  </button>
                )}
                <button
                  onClick={() => alert('PDF出力しました')}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  📄 PDF出力
                </button>
              </div>
            </div>

            {/* 工事種別タブ */}
            <div className="border-b flex gap-2 mb-3">
              <button
                onClick={() => setWorkTypeTab('工事')}
                className={`px-4 py-2 ${
                  workTypeTab === '工事'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                工事
              </button>
              <button
                onClick={() => setWorkTypeTab('保守点検')}
                className={`px-4 py-2 ${
                  workTypeTab === '保守点検'
                    ? 'border-b-2 border-green-600 text-green-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                保守点検
              </button>
              <button
                onClick={() => setWorkTypeTab('機器制作')}
                className={`px-4 py-2 ${
                  workTypeTab === '機器制作'
                    ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                機器制作
              </button>
            </div>
            <div className="flex gap-4 items-center border-t pt-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">担当者:</label>
                <select
                  value={managerFilter}
                  onChange={(e) => setManagerFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">すべて</option>
                  {getUniqueManagers().map(manager => (
                    <option key={manager} value={manager}>{manager}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">種別:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">すべて</option>
                  <option value="機械">機械</option>
                  <option value="電気">電気</option>
                  <option value="鋼造">鋼造</option>
                  <option value="通信">通信</option>
                  <option value="納品">納品</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">元/下:</label>
                <select
                  value={contractFilter}
                  onChange={(e) => setContractFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">すべて</option>
                  <option value="元">元請</option>
                  <option value="下">下請</option>
                </select>
              </div>
              <div className="ml-auto text-sm text-gray-600">
                表示中: {filteredProjects.length}件 / 全{mockProjects.length}件
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50">
          <div className="overflow-x-auto">
            <table className="excel-table" style={{ minWidth: '1800px' }}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{ width: '80px' }}>担当者</th>
                  <th rowSpan={2} style={{ width: '60px' }}>番号</th>
                  <th rowSpan={2} style={{ width: '80px' }}>受注No</th>
                  <th rowSpan={2} style={{ width: '50px' }}>種別</th>
                  <th rowSpan={2} style={{ width: '150px' }}>客先名<br/>現場名</th>
                  <th rowSpan={2} style={{ width: '200px' }}>件名</th>
                  <th rowSpan={2} style={{ width: '100px' }}>主任技術者<br/>代理人</th>
                  <th rowSpan={2} style={{ width: '40px' }}>元/下</th>
                  <th rowSpan={2} style={{ width: '40px' }}>専任</th>
                  <th
                    rowSpan={2}
                    style={{ width: '100px', cursor: 'pointer' }}
                    onClick={toggleSort}
                    className="hover:bg-gray-100 transition-colors"
                    title="クリックで並び替え"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>工期</span>
                      <span className="text-gray-500">
                        {sortOrder === 'desc' ? '↓' : '⇅'}
                      </span>
                    </div>
                  </th>
                  {/* 年ヘッダーまたは日別ヘッダー */}
                  {viewMode === 'month' ? (
                    <>
                      {(() => {
                        const yearGroups: { [key: number]: number } = {};
                        months.forEach(({ year }) => {
                          yearGroups[year] = (yearGroups[year] || 0) + 1;
                        });
                        return Object.entries(yearGroups).map(([year, count]) => (
                          <th key={year} colSpan={count} className="text-center">
                            {year}年
                          </th>
                        ));
                      })()}
                    </>
                  ) : (
                    <th colSpan={days.length} className="text-center">
                      {selectedYear}年{selectedMonth}月
                    </th>
                  )}
                  <th rowSpan={2} style={{ width: '150px' }}>備考</th>
                </tr>
                <tr>
                  {viewMode === 'month' ? (
                    months.map(({ monthName, month, year }, index) => (
                      <th
                        key={index}
                        className="gantt-cell cursor-pointer bg-blue-50 hover:bg-blue-200 transition-colors border-blue-200 text-blue-700 font-semibold"
                        onClick={() => handleMonthClick(year, month)}
                        title={`${year}年${monthName}の日別表示へ`}
                      >
                        {monthName}
                      </th>
                    ))
                  ) : (
                    days.map((day) => (
                      <th
                        key={day}
                        className="gantt-cell bg-green-50 border-green-200 text-green-700 font-semibold"
                        style={{ width: '40px' }}
                      >
                        {day}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, index) => (
                  <tr
                    key={project.id}
                    className={`${project.isCorins ? 'corins' : ''} cursor-pointer hover:bg-blue-50 transition-colors`}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    title="クリックで案件詳細を表示"
                  >
                    <td>{project.manager}</td>
                    <td>{index + 1}</td>
                    <td>{project.orderNo}</td>
                    <td>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        project.type === '機械' ? 'bg-blue-100 text-blue-800' :
                        project.type === '電気' ? 'bg-yellow-100 text-yellow-800' :
                        project.type === '鋼造' ? 'bg-gray-100 text-gray-800' :
                        project.type === '通信' ? 'bg-purple-100 text-purple-800' :
                        project.type === '納品' ? 'bg-green-100 text-green-800' :
                        project.type === 'その他' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.type}
                      </span>
                    </td>
                    <td>
                      <div>{project.clientName}</div>
                      <div className="text-xs">{project.siteName}</div>
                    </td>
                    <td>{project.projectName}</td>
                    <td>{project.engineer}</td>
                    <td>{project.contractType}</td>
                    <td>{project.exclusive ? '○' : ''}</td>
                    <td>
                      <div className="text-xs">
                        {project.startDate}<br/>
                        {project.endDate}
                      </div>
                    </td>
                    <td colSpan={viewMode === 'month' ? 18 : days.length} className="p-0" style={{ position: 'relative', height: '50px' }}>
                      <div className="gantt-row" style={{ position: 'relative' }}>
                        {(() => {
                          const barPos = getGanttBarPosition(project.startDate, project.endDate);
                          const partnerName = (project as any).partnerId
                            ? mockPartners.find(p => p.id === (project as any).partnerId)?.companyName
                            : null;

                          // 日別表示の場合で期間が0の場合はスキップ
                          if (viewMode === 'day' && barPos.duration === 0) {
                            return null;
                          }

                          if (viewMode === 'month') {
                            // 月表示の場合
                            // 保守点検・機器制作はシンプルなバーのみ、工事は4フェーズ表示
                            const projectWorkType = (project as any).workType;

                            if (projectWorkType === '保守点検' || projectWorkType === '機器制作') {
                              // 保守点検・機器制作はシンプルなバー
                              const hasPartner = partnerName && (project as any).partnerId;
                              return (
                                <>
                                  <div
                                    className="gantt-bar-container gantt-phase-construction"
                                    style={{
                                      left: `${barPos.left}px`,
                                      width: `${barPos.width}px`
                                    }}
                                  >
                                    <span className="gantt-phase-label">{project.currentPhase || '作業'}</span>
                                  </div>
                                  {hasPartner && (
                                    <div
                                      className="text-xs text-gray-600 cursor-pointer hover:underline hover:text-blue-600"
                                      style={{
                                        position: 'absolute',
                                        left: `${barPos.left}px`,
                                        top: '21px',
                                        fontSize: '10px',
                                        whiteSpace: 'nowrap'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/partners/${(project as any).partnerId}`);
                                      }}
                                      title="クリックで協力会社詳細を表示"
                                    >
                                      {partnerName}
                                    </div>
                                  )}
                                </>
                              );
                            } else {
                              // 工事は4フェーズ表示
                              const phases = getPhaseInfo(project.startDate, project.endDate, barPos.duration);
                              // 施工フェーズ（3番目のフェーズ、index=2）を起点として協力会社名を表示
                              const constructionPhase = phases[2]; // 施工フェーズ
                              const partnerLeftPosition = barPos.left + constructionPhase.left;
                              const hasPartner = partnerName && (project as any).partnerId;

                              return (
                                <>
                                  {phases.map((phase, idx) => (
                                    <div
                                      key={idx}
                                      className={`gantt-bar-container ${phase.className}`}
                                      style={{
                                        left: `${barPos.left + phase.left}px`,
                                        width: `${phase.width}px`
                                      }}
                                    >
                                      <span className="gantt-phase-label">{phase.label}</span>
                                    </div>
                                  ))}
                                  {hasPartner && (
                                    <div
                                      className="text-xs text-gray-600 cursor-pointer hover:underline hover:text-blue-600"
                                      style={{
                                        position: 'absolute',
                                        left: `${partnerLeftPosition}px`,
                                        top: '21px',
                                        fontSize: '10px',
                                        whiteSpace: 'nowrap'
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/partners/${(project as any).partnerId}`);
                                      }}
                                      title="クリックで協力会社詳細を表示"
                                    >
                                      {partnerName}
                                    </div>
                                  )}
                                </>
                              );
                            }
                          } else {
                            // 日別表示の場合はシンプルなバーのみ
                            const hasPartner = partnerName && (project as any).partnerId;
                            return (
                              <>
                                <div
                                  className="gantt-bar-container gantt-phase-construction"
                                  style={{
                                    left: `${barPos.left}px`,
                                    width: `${barPos.width}px`
                                  }}
                                >
                                  <span className="gantt-phase-label">{project.currentPhase || '施工'}</span>
                                </div>
                                {hasPartner && (
                                  <div
                                    className="text-xs text-gray-600 cursor-pointer hover:underline hover:text-blue-600"
                                    style={{
                                      position: 'absolute',
                                      left: `${barPos.left}px`,
                                      top: '21px',
                                      fontSize: '10px',
                                      whiteSpace: 'nowrap'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/partners/${(project as any).partnerId}`);
                                    }}
                                    title="クリックで協力会社詳細を表示"
                                  >
                                    {partnerName}
                                  </div>
                                )}
                              </>
                            );
                          }
                        })()}
                      </div>
                    </td>
                    <td className="text-xs">
                      {project.amount > 45000000 ? '専任必要' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}