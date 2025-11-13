'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockProjects, mockTasks, mockStaff } from '@/app/lib/mockData';

// タスクの期限による分類
type TaskWithProject = {
  taskId: string;
  taskName: string;
  projectId: string;
  projectOrderNo: string;
  projectName: string;
  assignee: string;
  deadline: string;
  phase: string;
  daysUntilDeadline: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [allTasks, setAllTasks] = useState<TaskWithProject[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskWithProject[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // 全タスクを取得してフラット化
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasksArray: TaskWithProject[] = [];

    Object.entries(mockTasks).forEach(([projectId, phases]) => {
      const project = mockProjects.find((p) => p.id === projectId);
      if (!project) return;

      Object.entries(phases).forEach(([phaseName, tasks]) => {
        tasks.forEach((task) => {
          const deadlineDate = new Date(task.deadline);
          deadlineDate.setHours(0, 0, 0, 0);
          const diffTime = deadlineDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          tasksArray.push({
            taskId: task.id,
            taskName: task.name,
            projectId,
            projectOrderNo: project.orderNo,
            projectName: project.projectName,
            assignee: task.assignee,
            deadline: task.deadline,
            phase: phaseName,
            daysUntilDeadline: diffDays,
          });
        });
      });
    });

    // 期限日が近い順にソート
    tasksArray.sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);

    setAllTasks(tasksArray);

    // 初期表示：ログインユーザー自身のタスクのみ
    if (user) {
      setSelectedStaff([user.name]);
      const userTasks = tasksArray.filter((task) => task.assignee === user.name);
      setFilteredTasks(userTasks);
    } else {
      setFilteredTasks(tasksArray);
    }
  }, [user]);

  // フィルター適用
  useEffect(() => {
    if (selectedStaff.length === 0 || selectedStaff.length === mockStaff.length) {
      // 全員選択
      setFilteredTasks(allTasks);
    } else {
      // 選択された担当者のタスクのみ
      const filtered = allTasks.filter((task) =>
        selectedStaff.includes(task.assignee)
      );
      setFilteredTasks(filtered);
    }
  }, [selectedStaff, allTasks]);

  // フィルターポップアップ外クリック検知
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 担当者フィルター切り替え
  const toggleStaffFilter = (staffName: string) => {
    if (selectedStaff.includes(staffName)) {
      setSelectedStaff(selectedStaff.filter((s) => s !== staffName));
    } else {
      setSelectedStaff([...selectedStaff, staffName]);
    }
  };

  // 全員選択/解除
  const toggleAllStaff = () => {
    if (selectedStaff.length === mockStaff.length) {
      // 全員選択されている場合は、ログインユーザーのみに戻す
      if (user) {
        setSelectedStaff([user.name]);
      } else {
        setSelectedStaff([]);
      }
    } else {
      // 全員選択
      setSelectedStaff(mockStaff.map((s) => s.name));
    }
  };

  // フィルター表示テキスト
  const getFilterDisplayText = () => {
    if (selectedStaff.length === 0) return '担当者を選択';
    if (selectedStaff.length === mockStaff.length) return '全員';
    if (selectedStaff.length === 1) return selectedStaff[0];
    return '複数人選択';
  };

  // タスクを7段階に分類（31日以降は非表示）
  const tasksWithin30Days = filteredTasks.filter((t) => t.daysUntilDeadline <= 30);
  const overdueTasks = tasksWithin30Days.filter((t) => t.daysUntilDeadline < 0);
  const todayTasks = tasksWithin30Days.filter((t) => t.daysUntilDeadline === 0);
  const tomorrow1DayTasks = tasksWithin30Days.filter((t) => t.daysUntilDeadline === 1);
  const within1WeekTasks = tasksWithin30Days.filter((t) => t.daysUntilDeadline >= 2 && t.daysUntilDeadline <= 7);
  const within2WeeksTasks = tasksWithin30Days.filter((t) => t.daysUntilDeadline >= 8 && t.daysUntilDeadline <= 14);
  const within3WeeksTasks = tasksWithin30Days.filter((t) => t.daysUntilDeadline >= 15 && t.daysUntilDeadline <= 21);
  const within1MonthTasks = tasksWithin30Days.filter((t) => t.daysUntilDeadline >= 22 && t.daysUntilDeadline <= 30);

  // 色分けクラスを取得（7段階）
  const getColorClass = (daysUntil: number) => {
    if (daysUntil < 0) return 'bg-red-50 border-red-500';
    if (daysUntil === 0) return 'bg-orange-50 border-orange-500';
    if (daysUntil === 1) return 'bg-yellow-50 border-yellow-500';
    if (daysUntil >= 2 && daysUntil <= 7) return 'bg-green-50 border-green-500';
    if (daysUntil >= 8 && daysUntil <= 14) return 'bg-blue-50 border-blue-500';
    if (daysUntil >= 15 && daysUntil <= 21) return 'bg-purple-50 border-purple-500';
    if (daysUntil >= 22 && daysUntil <= 30) return 'bg-gray-50 border-gray-500';
    return 'bg-gray-50 border-gray-300'; // 31日以降（表示されないがフォールバック）
  };

  const getTextColorClass = (daysUntil: number) => {
    if (daysUntil < 0) return 'text-red-700';
    if (daysUntil === 0) return 'text-orange-700';
    if (daysUntil === 1) return 'text-yellow-700';
    if (daysUntil >= 2 && daysUntil <= 7) return 'text-green-700';
    if (daysUntil >= 8 && daysUntil <= 14) return 'text-blue-700';
    if (daysUntil >= 15 && daysUntil <= 21) return 'text-purple-700';
    if (daysUntil >= 22 && daysUntil <= 30) return 'text-gray-700';
    return 'text-gray-600'; // 31日以降（表示されないがフォールバック）
  };

  // タスクセクションレンダリング
  const renderTaskSection = (
    title: string,
    tasks: TaskWithProject[],
    icon: string
  ) => {
    return (
      <div className="mb-6">
        <h3 className={`font-bold mb-3 text-lg flex items-center gap-2 ${tasks.length > 0 ? getTextColorClass(tasks[0]?.daysUntilDeadline || 0) : 'text-gray-600'}`}>
          <span>{icon}</span>
          <span>{title} ({tasks.length}件)</span>
        </h3>
        {tasks.length === 0 ? (
          <div className="bg-white rounded shadow p-4 text-center text-gray-400 text-sm">
            タスクなし
          </div>
        ) : (
          <div className="bg-white rounded shadow overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 w-24">受注No</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 w-64">案件名</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 w-48">タスク名</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 w-28">担当者</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 w-32">期限日</th>
                  <th className="text-left p-3 text-sm font-semibold text-gray-700 w-40">フェーズ</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.taskId}
                    className={`border-b border-l-4 ${getColorClass(task.daysUntilDeadline)} hover:opacity-80 cursor-pointer transition-opacity`}
                    onClick={() => router.push(`/projects/${task.projectId}`)}
                  >
                    <td className="p-3 text-sm w-24">{task.projectOrderNo}</td>
                    <td className="p-3 text-sm w-64 truncate" title={task.projectName}>
                      {task.projectName}
                    </td>
                    <td className="p-3 text-sm font-medium w-48 truncate" title={task.taskName}>{task.taskName}</td>
                    <td className="p-3 text-sm w-28">{task.assignee}</td>
                    <td className="p-3 text-sm w-32">{task.deadline}</td>
                    <td className="p-3 text-sm text-gray-600 w-40">{task.phase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-bold">期限管理ダッシュボード</h2>
          </div>
        </div>

        <div className="p-6">
          {/* 【v2.26新規】タスク割り当て依頼アラート */}
          {(() => {
            const taskAssignmentProjects = mockProjects.filter(p => p.status === 'タスク割当');
            if (taskAssignmentProjects.length === 0) return null;

            return (
              <div className="mb-6">
                <div className="bg-orange-50 border-l-4 border-orange-500 rounded shadow p-4">
                  <h3 className="font-bold text-orange-700 text-lg mb-3">
                    📋 タスク割り当て依頼が{taskAssignmentProjects.length}件あります
                  </h3>
                  <div className="bg-white rounded overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100 border-b">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold text-gray-700">受注No</th>
                          <th className="text-left p-3 text-sm font-semibold text-gray-700">案件名</th>
                          <th className="text-left p-3 text-sm font-semibold text-gray-700">担当者</th>
                          <th className="text-left p-3 text-sm font-semibold text-gray-700">工期開始日</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taskAssignmentProjects.map((project) => (
                          <tr
                            key={project.id}
                            className="border-b hover:bg-orange-50 cursor-pointer transition-colors"
                            onClick={() => router.push(`/projects/${project.id}`)}
                          >
                            <td className="p-3 text-sm">{project.orderNo}</td>
                            <td className="p-3 text-sm font-medium">{project.projectName}</td>
                            <td className="p-3 text-sm">{project.manager}</td>
                            <td className="p-3 text-sm">{project.startDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 自動車免許更新期限アラート */}
          {(() => {
            if (!user) return null;

            // ログインユーザーの従業員情報を取得
            const currentEmployee = mockStaff.find((s) => s.name === user.name);
            if (!currentEmployee || !currentEmployee.driverLicenseExpiry) return null;

            // 有効期限が1ヶ月前（30日前）以降かチェック
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expiryDate = new Date(currentEmployee.driverLicenseExpiry);
            expiryDate.setHours(0, 0, 0, 0);
            const oneMonthFromToday = new Date(today);
            oneMonthFromToday.setDate(oneMonthFromToday.getDate() + 30);

            // 有効期限が今日から30日以内の場合にアラート表示
            if (expiryDate <= oneMonthFromToday && expiryDate >= today) {
              return (
                <div className="mb-6">
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded shadow p-4">
                    <h3 className="font-bold text-yellow-700 text-lg mb-2">
                      ⚠️ あなたの自動車免許の有効期限が1ヶ月前に迫っています
                    </h3>
                    <p className="text-yellow-700">
                      有効期限：{currentEmployee.driverLicenseExpiry}
                    </p>
                    <button
                      onClick={() => router.push(`/staff/${currentEmployee.id}`)}
                      className="mt-3 text-sm bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                    >
                      詳細を確認
                    </button>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* 資格有効期限アラート */}
          {(() => {
            if (!user) return null;

            // ログインユーザーの従業員情報を取得
            const currentEmployee = mockStaff.find((s) => s.name === user.name);
            if (!currentEmployee || !currentEmployee.qualifications || currentEmployee.qualifications.length === 0) return null;

            // 有効期限が1ヶ月前（30日前）以降の免許資格をチェック
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const oneMonthFromToday = new Date(today);
            oneMonthFromToday.setDate(oneMonthFromToday.getDate() + 30);

            const expiringQualifications = currentEmployee.qualifications.filter((qual: any) => {
              if (qual.category1 !== '免許' || !qual.expiryDate) return false;

              const expiryDate = new Date(qual.expiryDate);
              expiryDate.setHours(0, 0, 0, 0);

              return expiryDate <= oneMonthFromToday && expiryDate >= today;
            });

            if (expiringQualifications.length === 0) return null;

            return (
              <div className="mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded shadow p-4">
                  <h3 className="font-bold text-yellow-700 text-lg mb-2">
                    ⚠️ あなたの資格の有効期限が1ヶ月前に迫っています
                  </h3>
                  <div className="space-y-2 mb-3">
                    {expiringQualifications.map((qual: any, index: number) => {
                      const expiryDate = new Date(qual.expiryDate);
                      const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                      let qualificationDisplayName = '';
                      if (qual.qualificationDetail) {
                        qualificationDisplayName = `${qual.qualificationName}（${qual.qualificationDetail}）`;
                      } else {
                        qualificationDisplayName = qual.qualificationName;
                      }

                      return (
                        <div key={index} className="bg-white rounded p-3 border border-yellow-300">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">{qualificationDisplayName}</p>
                              <p className="text-sm text-gray-600">
                                有効期限：{qual.expiryDate} <span className="font-bold text-yellow-700">（残り{daysRemaining}日）</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => router.push(`/staff/${currentEmployee.id}`)}
                    className="text-sm bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
                  >
                    詳細を確認
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 担当者フィルター */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-white border border-gray-300 rounded px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <span>👤 担当者: {getFilterDisplayText()}</span>
                <span className="text-gray-400">▼</span>
              </button>

              {isFilterOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-3 w-64 z-50">
                  <div className="mb-2">
                    <label className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStaff.length === mockStaff.length}
                        onChange={toggleAllStaff}
                        className="form-checkbox"
                      />
                      <span className="text-sm font-semibold">全員</span>
                    </label>
                  </div>
                  <div className="border-t pt-2 max-h-64 overflow-y-auto">
                    {mockStaff.map((staff) => (
                      <label
                        key={staff.id}
                        className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStaff.includes(staff.name)}
                          onChange={() => toggleStaffFilter(staff.name)}
                          className="form-checkbox"
                        />
                        <span className="text-sm">{staff.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              表示中のタスク: {tasksWithin30Days.length}件（30日以内）
            </div>
          </div>

          {/* 7段階タスクセクション */}
          {renderTaskSection('期限切れ', overdueTasks, '🔴')}
          {renderTaskSection('本日期限', todayTasks, '🟠')}
          {renderTaskSection('1日以内（明日）', tomorrow1DayTasks, '🟡')}
          {renderTaskSection('1週間以内（2〜7日）', within1WeekTasks, '🟢')}
          {renderTaskSection('2週間以内（8〜14日）', within2WeeksTasks, '🔵')}
          {renderTaskSection('3週間以内（15〜21日）', within3WeeksTasks, '🟣')}
          {renderTaskSection('1ヶ月以内（22〜30日）', within1MonthTasks, '⚪')}

          {tasksWithin30Days.length === 0 && (
            <div className="bg-white rounded shadow p-8 text-center text-gray-500">
              <p>表示するタスクがありません。</p>
              <p className="text-sm mt-2">
                {filteredTasks.length > 0
                  ? '30日以内の期限タスクがありません。'
                  : '担当者フィルターを変更してください。'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
