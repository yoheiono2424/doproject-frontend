'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockProjects } from '@/app/lib/mockData';

type SortOrder = 'default' | 'desc';

export default function SchedulePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [contractFilter, setContractFilter] = useState<string>('all');

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

  const months = [
    '9月', '10月', '11月', '12月', '1月', '2月',
    '3月', '4月', '5月', '6月', '7月', '8月'
  ];

  const handleMonthClick = (year: number, month: number) => {
    router.push(`/schedule/${year}/${month}`);
  };

  const getGanttBarPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const baseYear = 2025;
    const baseMonth = 8; // September

    // Calculate start position (in months from base)
    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const startPosition = (startYear - baseYear) * 12 + startMonth - baseMonth;

    // Calculate duration in months
    const endYear = end.getFullYear();
    const endMonth = end.getMonth();
    const duration = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

    // Convert to pixels (40px per cell)
    const left = startPosition * 40;
    const width = duration * 40;

    return { left, width, duration };
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
                <h2 className="text-2xl font-bold">2025年9月〜2026年8月 諸物件人員配置計画</h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="px-3 py-1 bg-pink-100 text-pink-700 font-bold rounded">※ 着色物件はコリンズ対象</div>
                  <div className="text-sm text-purple-700 font-bold">※ ￥45,000千万円以上の物件は、専任の主任技術者を配置する事</div>
                </div>
              </div>
              <button
                onClick={() => alert('PDF出力しました')}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                📄 PDF出力
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
                  <th colSpan={4} className="text-center">2025年</th>
                  <th colSpan={16} className="text-center">2026年</th>
                  <th colSpan={4} className="text-center">2027年</th>
                  <th rowSpan={2} style={{ width: '150px' }}>備考</th>
                </tr>
                <tr>
                  {months.concat(months).map((month, index) => {
                    // 2025年9月から始まる
                    let year, monthNum;
                    if (index < 4) {
                      // 9,10,11,12月は2025年
                      year = 2025;
                      monthNum = index + 9; // 9,10,11,12
                    } else if (index < 12) {
                      // 1-8月は2026年
                      year = 2026;
                      monthNum = index - 3; // 1,2,3,4,5,6,7,8
                    } else if (index < 16) {
                      // 9,10,11,12月は2026年
                      year = 2026;
                      monthNum = index - 3; // 9,10,11,12
                    } else {
                      // 1-8月は2027年
                      year = 2027;
                      monthNum = index - 15; // 1,2,3,4,5,6,7,8
                    }

                    return (
                      <th
                        key={index}
                        className="gantt-cell cursor-pointer bg-blue-50 hover:bg-blue-200 transition-colors border-blue-200 text-blue-700 font-semibold"
                        onClick={() => handleMonthClick(year, monthNum)}
                        title={`${year}年${month}の詳細を表示`}
                      >
                        {month}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, index) => (
                  <tr key={project.id} className={project.isCorins ? 'corins' : ''}>
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
                    <td colSpan={24} className="p-0" style={{ position: 'relative', height: '24px' }}>
                      <div className="gantt-row">
                        {(() => {
                          const barPos = getGanttBarPosition(project.startDate, project.endDate);
                          const phases = getPhaseInfo(project.startDate, project.endDate, barPos.duration);

                          return phases.map((phase, idx) => (
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
                          ));
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