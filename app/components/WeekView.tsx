'use client';

import { useState } from 'react';
import { CalendarDays, CheckSquare } from 'lucide-react';
import { getWeekDays, formatDate, getPreviousWeek, getNextWeek, getCurrentWeekStart } from '../lib/weekUtils';
import { mockProjects, mockTasks, mockStaff } from '../lib/mockData';

type PersonalEvent = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  userId: string;
};

type CalendarTaskType = {
  id: string;
  name: string;
  deadline: string;
  assignee: string;
  projectId: string;
  projectName: string;
  orderNo: string;
  clientName: string;
  siteName: string;
  phase: string;
  urgency: string;
  completed: boolean;
};

type WeekViewProps = {
  currentDate: Date;
  activeTab: 'all' | 'events' | 'tasks';
  selectedAssignees: string[];
  selectedProjects: string[];
  personalEvents: PersonalEvent[];
  currentUser: { id: string; name: string } | null;
  onTaskClick?: (taskId: string, projectId: string) => void;
  onEventClick?: (event: PersonalEvent) => void;
  onTaskHover?: (task: CalendarTaskType, event: React.MouseEvent) => void;
  onTaskLeave?: () => void;
};

export default function WeekView({
  currentDate,
  activeTab,
  selectedAssignees,
  selectedProjects,
  personalEvents,
  currentUser,
  onTaskClick,
  onEventClick,
  onTaskHover,
  onTaskLeave
}: WeekViewProps) {
  // 初期表示：本日が含まれる週の日曜日を取得
  const [weekStartDate, setWeekStartDate] = useState(() => getCurrentWeekStart());

  // 週の7日間を取得
  const weekDays = getWeekDays(weekStartDate);
  const weekDayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // 従業員リストを取得（ログインユーザーを最上部に固定、その後は役職優先の社員番号順）
  const getSortedEmployees = () => {
    // ログインユーザーの部署を取得
    const currentUserEmployee = mockStaff.find(emp => emp.name === currentUser?.name);
    const currentUserDepartment = currentUserEmployee?.department;

    // ログインユーザーの部署メンバーのみを抽出
    const departmentEmployees = currentUserDepartment
      ? mockStaff.filter(emp => emp.department === currentUserDepartment)
      : [...mockStaff];

    // ログインユーザー以外の従業員
    const otherEmployees = departmentEmployees.filter(emp => emp.name !== currentUser?.name);

    // 役職の優先順位を定義
    const jobTitlePriority: { [key: string]: number } = {
      '役員': 1,
      '部長': 2,
      '課長': 3,
      '課長補佐': 4,
      '係長': 5,
      '主任': 6,
      'メンバー': 7,
    };

    // 役職優先 + 社員番号順でソート
    otherEmployees.sort((a, b) => {
      const priorityA = jobTitlePriority[a.jobTitle] || 999;
      const priorityB = jobTitlePriority[b.jobTitle] || 999;

      // 役職が異なる場合は役職で比較
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // 役職が同じ場合は社員番号順
      const numA = parseInt(a.id.replace('s', ''));
      const numB = parseInt(b.id.replace('s', ''));
      return numA - numB;
    });

    // ログインユーザーを最上部に配置
    return currentUserEmployee ? [currentUserEmployee, ...otherEmployees] : otherEmployees;
  };

  const employees = getSortedEmployees();

  // 特定の日付・担当者のタスクを取得
  const getTasksForDateAndAssignee = (date: Date, assignee: string): CalendarTaskType[] => {
    const targetDateStr = formatDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks: CalendarTaskType[] = [];

    for (const project of mockProjects) {
      const projectTasks = mockTasks[project.id as keyof typeof mockTasks];
      if (!projectTasks) continue;

      // 案件フィルタリング
      if (selectedProjects.length > 0 && !selectedProjects.includes(project.id)) {
        continue;
      }

      for (const [phase, phaseTasks] of Object.entries(projectTasks)) {
        for (const task of phaseTasks) {
          if (task.assignee === assignee && task.deadline === targetDateStr) {
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

  // 特定の日付・担当者の個人予定を取得
  const getEventsForDateAndAssignee = (date: Date, assignee: string): PersonalEvent[] => {
    const targetDateStr = formatDate(date);
    return personalEvents.filter(event => {
      // モックデータではuserIdが従業員名として格納されている
      return event.date === targetDateStr && event.userId === assignee;
    });
  };

  // タスク・予定の背景色を取得
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return 'bg-red-100 border-red-300 text-red-800';
      case 'today': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'near': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  // 本日の日付かチェック
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // ナビゲーション
  const handlePreviousWeek = () => {
    setWeekStartDate(getPreviousWeek(weekStartDate));
  };

  const handleNextWeek = () => {
    setWeekStartDate(getNextWeek(weekStartDate));
  };

  const handleCurrentWeek = () => {
    setWeekStartDate(getCurrentWeekStart());
  };

  return (
    <div className="space-y-4">
      {/* 週ナビゲーション */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <button
          onClick={handlePreviousWeek}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← 前週
        </button>

        <div className="text-lg font-semibold">
          {weekDays[0].getFullYear()}年{weekDays[0].getMonth() + 1}月 第
          {Math.ceil((weekDays[0].getDate() + new Date(weekDays[0].getFullYear(), weekDays[0].getMonth(), 1).getDay()) / 7)}週
          ({weekDays[0].getMonth() + 1}/{weekDays[0].getDate()}〜{weekDays[6].getMonth() + 1}/{weekDays[6].getDate()})
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCurrentWeek}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            今週
          </button>
          <button
            onClick={handleNextWeek}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            次週 →
          </button>
        </div>
      </div>

      {/* 週表示テーブル */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 w-40 sticky left-0 bg-gray-100 z-10">
                従業員名
              </th>
              {weekDays.map((date, index) => (
                <th
                  key={index}
                  className={`border border-gray-300 p-3 min-w-32 ${
                    isToday(date) ? 'bg-yellow-100' : ''
                  } ${index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-bold">{weekDayNames[index]}</span>
                    <span className="text-sm">{date.getMonth() + 1}/{date.getDate()}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, empIndex) => (
              <tr key={employee.id} className={empIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border border-gray-300 p-3 font-semibold sticky left-0 bg-inherit z-10">
                  {employee.name}
                  {employee.name === currentUser?.name && (
                    <span className="ml-2 text-xs text-blue-600">(自分)</span>
                  )}
                </td>
                {weekDays.map((date, dayIndex) => {
                  const tasks = activeTab !== 'events' ? getTasksForDateAndAssignee(date, employee.name) : [];
                  const events = activeTab !== 'tasks' ? getEventsForDateAndAssignee(date, employee.name) : [];
                  const hasContent = tasks.length > 0 || events.length > 0;

                  return (
                    <td
                      key={dayIndex}
                      className={`border border-gray-300 p-2 align-top ${
                        isToday(date) ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        {/* 業務タスク表示 */}
                        {activeTab !== 'events' && tasks.map(task => (
                          <div
                            key={task.id}
                            className={`p-2 rounded border text-xs cursor-pointer hover:opacity-80 ${getUrgencyColor(task.urgency)}`}
                            onClick={() => onTaskClick?.(task.id, task.projectId)}
                            onMouseEnter={(e) => onTaskHover?.(task, e)}
                            onMouseLeave={onTaskLeave}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <CheckSquare className="w-3 h-3 flex-shrink-0" />
                              <span className="font-semibold truncate" title={task.name}>
                                {task.name}
                              </span>
                            </div>
                            <div className="text-xs truncate" title={`${task.orderNo}（${task.projectName}）`}>
                              {task.orderNo}（{task.projectName.length > 10 ? `${task.projectName.substring(0, 10)}...` : task.projectName}）
                            </div>
                          </div>
                        ))}

                        {/* 個人予定表示 */}
                        {activeTab !== 'tasks' && events.map(event => (
                          <div
                            key={event.id}
                            className="p-2 rounded border border-green-300 bg-green-100 text-green-800 text-xs cursor-pointer hover:opacity-80"
                            onClick={() => onEventClick?.(event)}
                          >
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              <span className="font-semibold truncate" title={event.title}>
                                {event.title}
                              </span>
                            </div>
                            <div className="text-xs mt-1">
                              {event.startTime}〜{event.endTime}
                            </div>
                          </div>
                        ))}

                        {/* 何もない場合 */}
                        {!hasContent && <div className="h-8"></div>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
