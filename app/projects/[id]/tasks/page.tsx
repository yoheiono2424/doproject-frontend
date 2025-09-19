'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockProjects, mockTasks } from '@/app/lib/mockData';

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

  type TasksType = {
    [key: string]: TaskType[];
  };

  const [editingTask, setEditingTask] = useState<{ id: string; name: string; assignee?: string; deadline?: string; phaseName: string; completed: boolean } | null>(null);
  const [formData, setFormData] = useState({
    assignee: '',
    deadline: '',
    changeReason: ''
  });

  const project = mockProjects.find(p => p.id === projectId);
  const tasks = mockTasks[projectId as keyof typeof mockTasks] || {};

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

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

  // タスクの編集開始
  const handleEditTask = (task: TaskType, phaseName: string) => {
    setEditingTask({ ...task, phaseName });
    setFormData({
      assignee: task.assignee || '',
      deadline: task.deadline || '',
      changeReason: ''
    });
  };

  // フォーム入力の処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 保存処理
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTask) return;

    console.log('タスク更新:', {
      projectId,
      taskId: editingTask.id,
      taskName: editingTask.name,
      phaseName: editingTask.phaseName,
      originalAssignee: editingTask.assignee,
      newAssignee: formData.assignee,
      originalDeadline: editingTask.deadline,
      newDeadline: formData.deadline,
      changeReason: formData.changeReason
    });
    alert(`「${editingTask.name}」を更新しました（実装：操作ログに記録）`);

    handleCancelEdit();
  };

  // 編集のキャンセル
  const handleCancelEdit = () => {
    setEditingTask(null);
    setFormData({
      assignee: '',
      deadline: '',
      changeReason: ''
    });
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

  // 全担当者リストを取得
  const getAllAssignees = () => {
    const assignees = new Set<string>();
    for (const phaseTasks of Object.values(tasks)) {
      for (const task of phaseTasks) {
        if (!['事務', '現場', '事務・現場', '現場→事務'].includes(task.assignee)) {
          assignees.add(task.assignee);
        }
      }
    }
    return Array.from(assignees).sort();
  };

  const allAssignees = getAllAssignees();

  // フェーズ情報の取得
  const getPhaseInfo = () => {
    const phases = ['契約フェーズ', '着工準備フェーズ', '施工フェーズ', '竣工フェーズ'];
    return phases.map(phaseName => {
      const phaseTasks: TaskType[] = (tasks as TasksType)[phaseName] || [];
      const tasksWithDeadlines = phaseTasks.filter(task => task.deadline);

      return {
        phaseName,
        taskCount: phaseTasks.length,
        tasksWithDeadlines: tasksWithDeadlines.length,
        tasks: phaseTasks
      };
    });
  };

  const phaseInfo = getPhaseInfo();

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
          {editingTask ? (
            // 期限編集フォーム
            <div className="bg-white rounded shadow">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-bold">タスク変更: {editingTask.name}</h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleSave}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      担当者 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="assignee"
                      value={formData.assignee}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">選択してください</option>
                      {allAssignees.map(assignee => (
                        <option key={assignee} value={assignee}>{assignee}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">新しい期限</label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">変更理由（任意）</label>
                    <textarea
                      name="changeReason"
                      value={formData.changeReason}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      rows={3}
                      placeholder="変更の理由や詳細を入力してください"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                      更新
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            // フェーズ・タスク一覧
            <div className="space-y-6">
              {phaseInfo.map((phase) => (
                <div key={phase.phaseName} className="bg-white rounded shadow">
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{phase.phaseName}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          タスク数: {phase.taskCount}件 | 期限設定済み: {phase.tasksWithDeadlines}件
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {phase.tasks.map((task: TaskType) => (
                        <div
                          key={task.id}
                          className={`p-3 border rounded ${getUrgencyClass(task.deadline)}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{task.name}</div>
                              <div className="text-sm text-gray-600">
                                担当者: {task.assignee}
                                {task.deadline && (
                                  <span className="ml-4">期限: {task.deadline}</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleEditTask(task, phase.phaseName)}
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                            >
                              変更
                            </button>
                          </div>
                        </div>
                      ))}
                      {phase.tasks.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          このフェーズにはタスクがありません
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}