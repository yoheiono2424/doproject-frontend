'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockProjects, mockTasks } from '@/app/lib/mockData';

export default function CalendarViewPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [hoveredTask, setHoveredTask] = useState<{ id: string; name: string; deadline: string; assignee: string; project: string; phase: string } | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{x: number, y: number} | null>(null);

  const year = parseInt(params.year as string);
  const month = parseInt(params.month as string);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  // カレンダー情報の計算
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  // 週の配列を生成
  const weeks = [];
  let currentWeek = [];

  // 最初の週の空白を追加
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // 日付を追加
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // 最後の週の残りを埋める
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  // すべての担当者を取得
  const getAllAssignees = () => {
    const assignees = new Set<string>();
    for (const project of mockProjects) {
      const projectTasks = mockTasks[project.id as keyof typeof mockTasks];
      if (!projectTasks) continue;
      for (const phaseTasks of Object.values(projectTasks)) {
        for (const task of phaseTasks) {
          // 「事務」「現場」「事務・現場」などの役職名を除外
          if (!['事務', '現場', '事務・現場', '現場→事務'].includes(task.assignee)) {
            assignees.add(task.assignee);
          }
        }
      }
    }
    return Array.from(assignees).sort();
  };

  const allAssignees = getAllAssignees();

  // 該当日のタスクを取得
  const getTasksForDate = (day: number) => {
    if (!day) return [];
    const targetDate = new Date(year, month - 1, day);
    const targetDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const tasks = [];

    // 各案件のタスクをチェック
    for (const project of mockProjects) {
      const projectTasks = mockTasks[project.id as keyof typeof mockTasks];
      if (!projectTasks) continue;

      // 各フェーズのタスクをチェック
      for (const [phase, phaseTasks] of Object.entries(projectTasks)) {
        for (const task of phaseTasks) {
          // 担当者名フィルタリング
          if (assigneeFilter !== 'all' && task.assignee !== assigneeFilter) {
            continue;
          }

          if (task.deadline === targetDateStr) {
            const deadlineDate = new Date(task.deadline);
            deadlineDate.setHours(0, 0, 0, 0);

            let urgency = 'normal';
            const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (deadlineDate < today) {
              urgency = 'overdue';
            } else if (deadlineDate.getTime() === today.getTime()) {
              urgency = 'today';
            } else if (daysUntil <= 3) {
              urgency = 'near';
            }

            tasks.push({
              ...task,
              projectId: project.id,
              projectName: project.projectName,
              orderNo: project.orderNo,
              clientName: project.clientName,
              siteName: project.siteName,
              phase,
              urgency
            });
          }
        }
      }
    }

    return tasks;
  };

  // 月の名前を取得
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  const navigateMonth = (direction: number) => {
    let newMonth = month + direction;
    let newYear = year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    router.push(`/schedule/${newYear}/${newMonth}`);
  };

  const handleTaskHover = (task: { id: string; name: string; deadline: string; assignee: string; project: string; phase: string }, event: React.MouseEvent) => {
    setHoveredTask(task);
    setHoveredPosition({ x: event.clientX, y: event.clientY });
  };

  const handleTaskLeave = () => {
    setHoveredTask(null);
    setHoveredPosition(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link href="/schedule" className="text-blue-600 hover:underline">
                  ← 工程表へ戻る
                </Link>
                <h2 className="text-2xl font-bold">
                  {year}年{monthNames[month - 1]} タスク期限カレンダー
                </h2>
                <div className="flex gap-3 ml-4">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 border border-red-300"></div>
                    <span className="text-xs">期限切れ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-100 border border-orange-300"></div>
                    <span className="text-xs">本日期限</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-100 border border-yellow-300"></div>
                    <span className="text-xs">3日以内</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-50 border border-blue-200"></div>
                    <span className="text-xs">通常</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">担当者名:</label>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="all">すべて</option>
                  {allAssignees.map(assignee => (
                    <option key={assignee} value={assignee}>{assignee}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white rounded shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <button
                onClick={() => navigateMonth(-1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                ← 前月
              </button>
              <span className="text-lg font-bold">
                {year}年 {monthNames[month - 1]}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                次月 →
              </button>
            </div>

            <div className="p-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {weekDays.map((day, index) => (
                      <th
                        key={day}
                        className={`border p-2 text-center ${
                          index === 0 ? 'bg-red-50 text-red-600' :
                          index === 6 ? 'bg-blue-50 text-blue-600' :
                          'bg-gray-50'
                        }`}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                    {weeks.map((week, weekIndex) => (
                      <tr key={weekIndex}>
                        {week.map((day, dayIndex) => {
                          const tasks = day ? getTasksForDate(day) : [];
                          const isToday = day === new Date().getDate() &&
                                        month === new Date().getMonth() + 1 &&
                                        year === new Date().getFullYear();
                          const hasNoTasks = day && tasks.length === 0;

                          return (
                            <td
                              key={`${weekIndex}-${dayIndex}`}
                              className={`border p-1 align-top ${
                                !day ? 'bg-gray-50' :
                                isToday ? 'bg-yellow-50' :
                                dayIndex === 0 ? 'bg-red-50' :
                                dayIndex === 6 ? 'bg-blue-50' :
                                ''
                              }`}
                              style={{
                                minHeight: hasNoTasks || !day ? '80px' : 'auto',
                                width: '14.28%',
                                height: hasNoTasks || !day ? '80px' : 'auto'
                              }}
                            >
                              {day && (
                                <>
                                  <div className={`font-bold mb-1 ${
                                    hasNoTasks ? 'text-sm' : 'text-lg'
                                  } ${
                                    isToday ? 'text-yellow-600' :
                                    dayIndex === 0 ? 'text-red-600' :
                                    dayIndex === 6 ? 'text-blue-600' :
                                    ''
                                  }`}>
                                    {day}
                                  </div>
                                  <div className="space-y-1" style={{ fontSize: '11px' }}>
                                    {tasks.map((task: { id: string; name: string; deadline: string; assignee: string; project: string; phase: string }) => (
                                      <div
                                        key={task.id}
                                        className={`p-0.5 rounded cursor-pointer hover:opacity-80 ${
                                          task.urgency === 'overdue' ? 'bg-red-100 text-red-700 border border-red-300' :
                                          task.urgency === 'today' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                                          task.urgency === 'near' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                                          'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}
                                        onClick={() => router.push(`/projects/${task.projectId}`)}
                                        onMouseEnter={(e) => handleTaskHover(task, e)}
                                        onMouseLeave={handleTaskLeave}
                                        title={`${task.orderNo} ${task.projectName}`}
                                      >
                                        <div className="font-semibold truncate">{task.name}</div>
                                        <div className="opacity-75" style={{ fontSize: '10px' }}>({task.orderNo})</div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* タスク詳細ポップアップ */}
      {hoveredTask && hoveredPosition && (
        <div
          style={{
            position: 'fixed',
            left: hoveredPosition.x + 10,
            top: hoveredPosition.y + 10,
            zIndex: 1000,
            maxWidth: '300px',
          }}
          className="bg-white shadow-lg rounded-lg border border-gray-200 p-4"
        >
          <div className="font-bold text-lg mb-2">{hoveredTask.name}</div>
          <div className="space-y-1 text-sm">
            <div><span className="font-semibold">受注No:</span> {hoveredTask.orderNo}</div>
            <div><span className="font-semibold">案件名:</span> {hoveredTask.projectName}</div>
            <div><span className="font-semibold">客先:</span> {hoveredTask.clientName}</div>
            <div><span className="font-semibold">現場:</span> {hoveredTask.siteName}</div>
            <div><span className="font-semibold">フェーズ:</span> {hoveredTask.phase}</div>
            <div><span className="font-semibold">担当者:</span> {hoveredTask.assignee}</div>
            <div><span className="font-semibold">期限:</span> {hoveredTask.deadline}</div>
            <div className={`font-semibold ${
              hoveredTask.urgency === 'overdue' ? 'text-red-700' :
              hoveredTask.urgency === 'today' ? 'text-orange-700' :
              hoveredTask.urgency === 'near' ? 'text-yellow-700' :
              'text-green-700'
            }`}>
              ステータス: {
                hoveredTask.urgency === 'overdue' ? '期限切れ' :
                hoveredTask.urgency === 'today' ? '本日期限' :
                hoveredTask.urgency === 'near' ? '3日以内' :
                '通常'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}