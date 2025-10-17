'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockProjects, mockTasks, mockStaff } from '@/app/lib/mockData';

export default function TaskManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const projectId = params.id as string;

  type TaskType = {
    id: string;
    name: string;
    completed: boolean;
    deadline?: string;
    assignee?: string;
  };

  type EditableTaskType = TaskType & {
    phaseName: string;
  };

  const project = mockProjects.find(p => p.id === projectId);
  const tasks = mockTasks[projectId as keyof typeof mockTasks] || {};

  // 【v2.26】全タスクをフラット化して編集可能な状態で管理
  const [editableTasks, setEditableTasks] = useState<EditableTaskType[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // 初期データの読み込み
  useEffect(() => {
    const flatTasks: EditableTaskType[] = [];
    Object.entries(tasks).forEach(([phaseName, phaseTasks]) => {
      phaseTasks.forEach((task) => {
        flatTasks.push({
          ...task,
          phaseName,
        });
      });
    });
    setEditableTasks(flatTasks);
  }, [projectId]);

  if (!isAuthenticated) {
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="content-area p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            案件が見つかりません
          </div>
          <Link href="/projects" className="text-blue-600 hover:underline mt-4 inline-block">
            案件一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // タスクの値を更新
  const updateTask = (taskId: string, field: 'assignee' | 'deadline', value: string) => {
    setEditableTasks(editableTasks.map(task =>
      task.id === taskId ? { ...task, [field]: value } : task
    ));
  };

  // タスクを削除
  const deleteTask = (taskId: string) => {
    if (confirm('このタスクを削除しますか？')) {
      setEditableTasks(editableTasks.filter(task => task.id !== taskId));
    }
  };

  // タスクを追加
  const addTask = (phaseName: string) => {
    const newTaskId = `t${Date.now()}`;
    const newTask: EditableTaskType = {
      id: newTaskId,
      name: '新しいタスク',
      completed: false,
      deadline: '',
      assignee: '',
      phaseName,
    };
    setEditableTasks([...editableTasks, newTask]);
  };

  // タスク名を更新
  const updateTaskName = (taskId: string, name: string) => {
    setEditableTasks(editableTasks.map(task =>
      task.id === taskId ? { ...task, name } : task
    ));
  };

  // 【v2.26】保存して完了
  const handleSaveAndComplete = () => {
    console.log('保存して完了:', editableTasks);
    alert('タスクを保存しました。案件ステータスを「進行中」に変更しました。');
    router.push(`/projects/${projectId}`);
  };

  // 【v2.26】保存のみ
  const handleSaveOnly = () => {
    console.log('保存のみ:', editableTasks);
    alert('タスクを保存しました。');
    router.push(`/projects/${projectId}`);
  };

  // 【v2.26】キャンセル
  const handleCancel = () => {
    if (confirm('変更を破棄して戻りますか？')) {
      router.push(`/projects/${projectId}`);
    }
  };

  // 期限の緊急度を判定
  const getUrgencyClass = (deadline?: string) => {
    if (!deadline) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (deadlineDate < today) {
      return 'bg-red-50 border-l-4 border-red-400';
    } else if (deadlineDate.getTime() === today.getTime()) {
      return 'bg-orange-50 border-l-4 border-orange-400';
    } else if (daysUntil <= 3) {
      return 'bg-yellow-50 border-l-4 border-yellow-400';
    }
    return 'bg-blue-50 border-l-4 border-blue-400';
  };

  // フェーズごとにタスクをグループ化
  const phases = ['契約フェーズ', '着工準備フェーズ', '施工フェーズ', '竣工フェーズ'];
  const tasksByPhase = phases.map(phaseName => ({
    phaseName,
    tasks: editableTasks.filter(task => task.phaseName === phaseName),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">
                  ← 案件詳細に戻る
                </Link>
                <h2 className="text-2xl font-bold">タスク期限管理</h2>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {project.orderNo} - {project.projectName}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* 【v2.26】保存オプションボタン（上部に移動） */}
          <div className="mb-6 flex gap-3 bg-white p-3 rounded shadow">
            <button
              onClick={handleSaveAndComplete}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-semibold"
            >
              保存して完了（ステータスを「進行中」に変更）
            </button>
            <button
              onClick={handleSaveOnly}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-semibold"
            >
              保存のみ（ステータス変更なし）
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm font-semibold"
            >
              キャンセル
            </button>
          </div>

          {/* フェーズ別タスク一覧（一括編集モード） */}
          <div className="space-y-4">
            {tasksByPhase.map((phase) => (
              <div key={phase.phaseName} className="bg-white rounded shadow">
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-base">{phase.phaseName}</h3>
                      <div className="text-xs text-gray-600 mt-0.5">
                        タスク数: {phase.tasks.length}件
                      </div>
                    </div>
                    <button
                      onClick={() => addTask(phase.phaseName)}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                    >
                      ＋ タスク追加
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <div className="space-y-2">
                    {phase.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-2 border rounded ${getUrgencyClass(task.deadline)}`}
                      >
                        <div className="grid grid-cols-12 gap-2 items-center">
                          {/* タスク名 */}
                          <div className="col-span-4">
                            <label className="block text-xs text-gray-600 mb-0.5">
                              タスク名
                            </label>
                            <input
                              type="text"
                              value={task.name}
                              onChange={(e) => updateTaskName(task.id, e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm"
                            />
                          </div>

                          {/* 担当者 */}
                          <div className="col-span-3">
                            <label className="block text-xs text-gray-600 mb-0.5">
                              担当者 <span className="text-red-600">*</span>
                            </label>
                            <select
                              value={task.assignee || ''}
                              onChange={(e) => updateTask(task.id, 'assignee', e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm"
                              required
                            >
                              <option value="">選択してください</option>
                              {mockStaff.map((staff) => (
                                <option key={staff.id} value={staff.name}>
                                  {staff.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 期限 */}
                          <div className="col-span-3">
                            <label className="block text-xs text-gray-600 mb-0.5">
                              期限
                            </label>
                            <input
                              type="date"
                              value={task.deadline || ''}
                              onChange={(e) => updateTask(task.id, 'deadline', e.target.value)}
                              className="w-full border rounded px-2 py-1 text-sm"
                            />
                          </div>

                          {/* 削除ボタン */}
                          <div className="col-span-2 flex justify-end">
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs hover:bg-red-200"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {phase.tasks.length === 0 && (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        このフェーズにはタスクがありません
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
