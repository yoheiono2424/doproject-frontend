'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import WeekView from '@/app/components/WeekView';
import { useAuthStore } from '@/app/lib/store';
import { mockProjects, mockTasks, mockPersonalEvents, mockStaff } from '@/app/lib/mockData';
import { CalendarDays, CheckSquare, Calendar as CalendarIcon, List } from 'lucide-react';

export default function CalendarViewPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [showAssigneePopup, setShowAssigneePopup] = useState(false);
  const [showProjectPopup, setShowProjectPopup] = useState(false);
  const [showDepartmentPopup, setShowDepartmentPopup] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'tasks'>('all');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>(mockPersonalEvents);
  const [editingEvent, setEditingEvent] = useState<PersonalEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

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

  const [hoveredTask, setHoveredTask] = useState<CalendarTaskType | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{x: number, y: number} | null>(null);

  const year = parseInt(params.year as string);
  const month = parseInt(params.month as string);

  // 初期表示：URLパラメータまたはログインユーザー自身のタスクのみ選択
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    } else if (user && selectedAssignees.length === 0) {
      // URLパラメータからフィルター状態を復元
      const searchParams = new URLSearchParams(window.location.search);
      const assigneesParam = searchParams.get('assignees');
      const projectsParam = searchParams.get('projects');

      if (assigneesParam) {
        setSelectedAssignees(assigneesParam.split(','));
      } else {
        // URLパラメータがない場合はデフォルト（ログインユーザー）
        setSelectedAssignees([user.name]);
      }

      if (projectsParam) {
        setSelectedProjects(projectsParam.split(','));
      }
    }
  }, [isAuthenticated, router, user, selectedAssignees.length]);

  // 週表示→月表示に戻った時、担当者フィルターをログインユーザーのみにリセット
  useEffect(() => {
    if (viewMode === 'month' && user) {
      setSelectedAssignees([user.name]);
    }
  }, [viewMode, user]);

  // ポップアップ外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-popup')) {
        setShowAssigneePopup(false);
        setShowProjectPopup(false);
        setShowDepartmentPopup(false);
      }
    };

    if (showAssigneePopup || showProjectPopup || showDepartmentPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAssigneePopup, showProjectPopup, showDepartmentPopup]);

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

      // 案件フィルタリング（全件選択または選択された案件のみ）
      if (selectedProjects.length > 0 && !selectedProjects.includes(project.id)) {
        continue;
      }

      // 各フェーズのタスクをチェック
      for (const [phase, phaseTasks] of Object.entries(projectTasks)) {
        for (const task of phaseTasks) {
          // 担当者名フィルタリング（複数選択対応）
          if (selectedAssignees.length > 0 && !selectedAssignees.includes(task.assignee)) {
            continue;
          }

          // 部署フィルタリング
          if (selectedDepartments.length > 0) {
            const staff = mockStaff.find(s => s.name.includes(task.assignee));
            if (!staff || !selectedDepartments.includes(staff.department)) {
              continue;
            }
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

    // フィルター状態をURLパラメータとして保持
    const params = new URLSearchParams();
    if (selectedAssignees.length > 0) {
      params.set('assignees', selectedAssignees.join(','));
    }
    if (selectedProjects.length > 0) {
      params.set('projects', selectedProjects.join(','));
    }

    const queryString = params.toString();
    router.push(`/schedule/${newYear}/${newMonth}${queryString ? `?${queryString}` : ''}`);
  };

  const handleTaskHover = (task: CalendarTaskType, event: React.MouseEvent) => {
    setHoveredTask(task);
    setHoveredPosition({ x: event.clientX, y: event.clientY });
  };

  const handleTaskLeave = () => {
    setHoveredTask(null);
    setHoveredPosition(null);
  };

  // 個人予定関連の関数
  const getEventsForDate = (day: number) => {
    if (!day) return [];
    const targetDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let filteredEvents = personalEvents.filter(event => event.date === targetDate);

    // 担当者フィルター適用（選択されている場合のみ）
    if (selectedAssignees.length > 0 && selectedAssignees.length < allAssignees.length) {
      filteredEvents = filteredEvents.filter(event => selectedAssignees.includes(event.userId));
    }

    // 部署フィルター適用
    if (selectedDepartments.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
        const staff = mockStaff.find(s => s.name.includes(event.userId));
        return staff && selectedDepartments.includes(staff.department);
      });
    }

    return filteredEvents;
  };

  const handleDateClick = (day: number) => {
    if (!day) return;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleAddEventClick = () => {
    setSelectedDate(null);
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: PersonalEvent) => {
    setEditingEvent(event);
    setSelectedDate(event.date);
    setShowEventModal(true);
  };

  const handleSaveEvent = (eventData: { title: string; date: string; startTime: string; endTime: string }) => {
    if (editingEvent) {
      // 編集
      setPersonalEvents(personalEvents.map(e =>
        e.id === editingEvent.id
          ? { ...e, ...eventData }
          : e
      ));
    } else {
      // 新規追加
      const newEvent: PersonalEvent = {
        id: Date.now().toString(),
        ...eventData,
        userId: user?.name || '',
      };
      setPersonalEvents([...personalEvents, newEvent]);
    }
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setPersonalEvents(personalEvents.filter(e => e.id !== eventId));
    setShowEventModal(false);
    setEditingEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">
                  {year}年{monthNames[month - 1]} カレンダー
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
              <button
                onClick={handleAddEventClick}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                + 予定追加
              </button>
            </div>

            {/* 表示切り替えボタン */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  viewMode === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                月表示
              </button>
              <button
                onClick={() => {
                  setViewMode('week');
                  // 週表示に切り替えたら全員を表示
                  setSelectedAssignees(allAssignees);
                  // ログインユーザーの部署を部署フィルターに設定
                  if (user) {
                    const currentUserStaff = mockStaff.find(s => s.name === user.name);
                    if (currentUserStaff) {
                      setSelectedDepartments([currentUserStaff.department]);
                    }
                  }
                }}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                週表示
              </button>
            </div>

            {/* タブ */}
            <div className="mt-4 border-b flex gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 ${
                  activeTab === 'all'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                全て
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 ${
                  activeTab === 'events'
                    ? 'border-b-2 border-green-600 text-green-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                予定
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 ${
                  activeTab === 'tasks'
                    ? 'border-b-2 border-purple-600 text-purple-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                タスク
              </button>
            </div>

            {/* フィルター */}
            <div className="mt-4 flex gap-4 items-center flex-wrap">
              {/* 担当者フィルター（すべてのタブで表示） */}
              <div className="relative filter-popup">
                <button
                  onClick={() => setShowAssigneePopup(!showAssigneePopup)}
                  className="border rounded px-3 py-2 text-sm bg-white hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="font-semibold">担当者:</span>
                  <span className="text-gray-600">
                    {selectedAssignees.length === 0
                      ? '全員'
                      : selectedAssignees.length === allAssignees.length
                        ? '全員'
                        : selectedAssignees.length === 1
                          ? selectedAssignees[0]
                          : '複数人選択'}
                  </span>
                  <span>▼</span>
                </button>

                {showAssigneePopup && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-4 z-50 w-64">
                    <div className="mb-2 pb-2 border-b">
                      <label className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAssignees.length === allAssignees.length || selectedAssignees.length === 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAssignees(allAssignees);
                            } else {
                              setSelectedAssignees([]);
                            }
                          }}
                        />
                        <span className="font-semibold">全員</span>
                      </label>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {allAssignees.map(assignee => (
                        <label key={assignee} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedAssignees.includes(assignee)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAssignees([...selectedAssignees, assignee]);
                              } else {
                                setSelectedAssignees(selectedAssignees.filter(a => a !== assignee));
                              }
                            }}
                          />
                          <span>{assignee}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 部署フィルター（すべてのタブで表示） */}
              <div className="relative filter-popup">
                <button
                  onClick={() => setShowDepartmentPopup(!showDepartmentPopup)}
                  className="border rounded px-3 py-2 text-sm bg-white hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="font-semibold">部署:</span>
                  <span className="text-gray-600">
                    {selectedDepartments.length === 0
                      ? 'すべて'
                      : selectedDepartments.length === 1
                        ? selectedDepartments[0]
                        : '複数選択'}
                  </span>
                  <span>▼</span>
                </button>

                {showDepartmentPopup && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-4 z-50 w-64">
                    <div className="mb-2 pb-2 border-b">
                      <label className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.length === 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDepartments([]);
                            }
                          }}
                        />
                        <span className="font-semibold">すべて</span>
                      </label>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {['技術部1課', '技術部2課', '営業部', '総務部', '役員'].map(dept => (
                        <label key={dept} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDepartments.includes(dept)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDepartments([...selectedDepartments, dept]);
                              } else {
                                setSelectedDepartments(selectedDepartments.filter(d => d !== dept));
                              }
                            }}
                          />
                          <span>{dept}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 案件フィルター（タスク・全てタブのみ表示） */}
              {activeTab !== 'events' && (
              <div className="relative filter-popup">
                <button
                  onClick={() => setShowProjectPopup(!showProjectPopup)}
                  className="border rounded px-3 py-2 text-sm bg-white hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="font-semibold">案件:</span>
                  <span className="text-gray-600">
                    {selectedProjects.length === 0 ? '全件' : selectedProjects.length === mockProjects.length ? '全件' : `${selectedProjects.length}件選択中`}
                  </span>
                  <span>▼</span>
                </button>

                {showProjectPopup && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-4 z-50 w-96">
                    <div className="mb-2">
                      <input
                        type="text"
                        placeholder="🔍 案件名・受注Noで検索..."
                        value={projectSearchQuery}
                        onChange={(e) => setProjectSearchQuery(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="mb-2 pb-2 border-b">
                      <label className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProjects.length === mockProjects.length || selectedProjects.length === 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjects(mockProjects.map(p => p.id));
                            } else {
                              setSelectedProjects([]);
                            }
                          }}
                        />
                        <span className="font-semibold">全件</span>
                      </label>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {mockProjects
                        .filter(project =>
                          projectSearchQuery === '' ||
                          project.projectName.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
                          project.orderNo.toLowerCase().includes(projectSearchQuery.toLowerCase())
                        )
                        .map(project => (
                          <label key={project.id} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedProjects.includes(project.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProjects([...selectedProjects, project.id]);
                                } else {
                                  setSelectedProjects(selectedProjects.filter(p => p !== project.id));
                                }
                              }}
                            />
                            <span className="text-sm">
                              {project.orderNo} - {project.projectName}
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {viewMode === 'week' ? (
            /* 週表示 */
            <WeekView
              currentDate={new Date(year, month - 1, 1)}
              activeTab={activeTab}
              selectedAssignees={selectedAssignees}
              selectedProjects={selectedProjects}
              personalEvents={personalEvents}
              currentUser={user}
              onTaskClick={(taskId, projectId) => {
                router.push(`/projects/${projectId}`);
              }}
              onEventClick={handleEventClick}
              onTaskHover={handleTaskHover}
              onTaskLeave={handleTaskLeave}
            />
          ) : (
            /* 月表示 */
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
                          const events = day ? getEventsForDate(day) : [];
                          const isToday = day === new Date().getDate() &&
                                        month === new Date().getMonth() + 1 &&
                                        year === new Date().getFullYear();

                          // タブごとの表示判定
                          const shouldShowTasks = (activeTab === 'tasks' || activeTab === 'all') && tasks.length > 0;
                          const shouldShowEvents = (activeTab === 'events' || activeTab === 'all') && events.length > 0;
                          const hasNoContent = day && !shouldShowTasks && !shouldShowEvents;

                          return (
                            <td
                              key={`${weekIndex}-${dayIndex}`}
                              className={`border p-1 align-top cursor-pointer hover:bg-gray-100 ${
                                !day ? 'bg-gray-50' :
                                isToday ? 'bg-yellow-50' :
                                dayIndex === 0 ? 'bg-red-50' :
                                dayIndex === 6 ? 'bg-blue-50' :
                                ''
                              }`}
                              style={{
                                minHeight: hasNoContent || !day ? '80px' : 'auto',
                                width: '14.28%',
                                height: hasNoContent || !day ? '80px' : 'auto'
                              }}
                              onClick={() => day && handleDateClick(day)}
                            >
                              {day && (
                                <>
                                  <div className={`font-bold mb-1 ${
                                    hasNoContent ? 'text-sm' : 'text-lg'
                                  } ${
                                    isToday ? 'text-yellow-600' :
                                    dayIndex === 0 ? 'text-red-600' :
                                    dayIndex === 6 ? 'text-blue-600' :
                                    ''
                                  }`}>
                                    {day}
                                  </div>
                                  <div className="space-y-1" style={{ fontSize: '11px' }}>
                                    {/* 業務タスクの表示（一番上） */}
                                    {shouldShowTasks && tasks.map((task: CalendarTaskType) => (
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
                                        <div className="font-semibold truncate flex items-center gap-1">
                                          <CheckSquare size={12} />
                                          <span>{task.name}</span>
                                        </div>
                                        <div className="opacity-75 truncate" style={{ fontSize: '10px' }}>
                                          {task.orderNo}（{task.projectName.length > 15 ? `${task.projectName.substring(0, 15)}...` : task.projectName}）
                                        </div>
                                      </div>
                                    ))}

                                    {/* 個人予定の表示（タスクの下） */}
                                    {shouldShowEvents && events.map((event: PersonalEvent) => (
                                      <div
                                        key={event.id}
                                        className="p-0.5 rounded cursor-pointer hover:opacity-80 bg-green-100 text-green-700 border border-green-300"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEventClick(event);
                                        }}
                                        title={`${event.title} (${event.startTime}-${event.endTime})`}
                                      >
                                        <div className="font-semibold truncate flex items-center gap-1">
                                          <CalendarDays size={12} />
                                          <span>{event.title}</span>
                                        </div>
                                        <div className="opacity-75 truncate" style={{ fontSize: '10px' }}>
                                          {event.startTime} - {event.endTime}
                                        </div>
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
          )}
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

      {/* 個人予定追加・編集モーダル */}
      {showEventModal && <EventModal />}
    </div>
  );

  function EventModal() {
    const [title, setTitle] = useState(editingEvent?.title || '');
    const [date, setDate] = useState(selectedDate || editingEvent?.date || '');
    const [startTime, setStartTime] = useState(editingEvent?.startTime || '');
    const [endTime, setEndTime] = useState(editingEvent?.endTime || '');

    const handleSubmit = () => {
      if (!title || !date || !startTime || !endTime) {
        alert('すべての項目を入力してください');
        return;
      }
      handleSaveEvent({ title, date, startTime, endTime });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">
            {editingEvent ? '予定を編集' : '予定を追加'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">予定名 <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="予定名を入力"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">日付 <span className="text-red-600">*</span></label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">開始時刻 <span className="text-red-600">*</span></label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">終了時刻 <span className="text-red-600">*</span></label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-2 justify-end">
            {editingEvent && (
              <button
                onClick={() => {
                  if (confirm('この予定を削除しますか？')) {
                    handleDeleteEvent(editingEvent.id);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                削除
              </button>
            )}
            <button
              onClick={() => setShowEventModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }
}