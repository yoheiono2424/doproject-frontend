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

  // タスクを5段階に分類
  const overdueTasks = filteredTasks.filter((t) => t.daysUntilDeadline < 0);
  const todayTasks = filteredTasks.filter((t) => t.daysUntilDeadline === 0);
  const within3DaysTasks = filteredTasks.filter((t) => t.daysUntilDeadline > 0 && t.daysUntilDeadline <= 3);
  const within7DaysTasks = filteredTasks.filter((t) => t.daysUntilDeadline > 3 && t.daysUntilDeadline <= 7);
  const after7DaysTasks = filteredTasks.filter((t) => t.daysUntilDeadline > 7);

  // 色分けクラスを取得
  const getColorClass = (daysUntil: number) => {
    if (daysUntil < 0) return 'bg-red-50 border-red-500';
    if (daysUntil === 0) return 'bg-orange-50 border-orange-500';
    if (daysUntil <= 3) return 'bg-yellow-50 border-yellow-500';
    if (daysUntil <= 7) return 'bg-green-50 border-green-500';
    return 'bg-blue-50 border-blue-500';
  };

  const getTextColorClass = (daysUntil: number) => {
    if (daysUntil < 0) return 'text-red-700';
    if (daysUntil === 0) return 'text-orange-700';
    if (daysUntil <= 3) return 'text-yellow-700';
    if (daysUntil <= 7) return 'text-green-700';
    return 'text-blue-700';
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
              表示中のタスク: {filteredTasks.length}件
            </div>
          </div>

          {/* 5段階タスクセクション */}
          {renderTaskSection('期限切れ', overdueTasks, '🔴')}
          {renderTaskSection('本日期限', todayTasks, '🟠')}
          {renderTaskSection('3日以内', within3DaysTasks, '🟡')}
          {renderTaskSection('7日以内', within7DaysTasks, '🟢')}
          {renderTaskSection('7日以降', after7DaysTasks, '🔵')}

          {filteredTasks.length === 0 && (
            <div className="bg-white rounded shadow p-8 text-center text-gray-500">
              <p>表示するタスクがありません。</p>
              <p className="text-sm mt-2">担当者フィルターを変更してください。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
