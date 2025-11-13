'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockProjects, mockTasks, mockPartners } from '@/app/lib/mockData';
import { usePermissions } from '@/app/lib/usePermissions';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { canEditProjectDetails } = usePermissions();
  const projectId = params.id as string;
  
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">案件詳細 - {project.orderNo}</h2>
            <Link href="/projects" className="text-blue-600 hover:underline">
              ← 案件一覧へ戻る
            </Link>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-white rounded shadow mb-6">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold">基本情報</h3>
              <Link
                href={`/projects/${projectId}/edit`}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                基本情報編集
              </Link>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">受注No</label>
                  <div className="font-medium">{project.orderNo}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">種別</label>
                  <div className="font-medium">{project.type}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">客先名</label>
                  <div className="font-medium">{project.clientName}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">現場名/場所</label>
                  <div className="font-medium">{project.siteName}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">件名</label>
                  <div className="font-medium">{project.projectName}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">契約金額</label>
                  <div className="font-medium">¥{project.amount.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">工期</label>
                  <div className="font-medium">{project.startDate} 〜 {project.endDate}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">主任技術者</label>
                  <div className="font-medium">{project.engineer}{project.exclusive ? '（専任）' : ''}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">現在フェーズ</label>
                  <div className="font-medium">
                    <span className="status-badge bg-blue-100 text-blue-700">
                      {project.currentPhase}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-600">協力会社</label>
                  <div className="font-medium">
                    {project.partnerIds && project.partnerIds.length > 0 && project.partnerIds[0] !== '' ? (
                      <div className="space-y-1">
                        {project.partnerIds.map((partnerId, index) => {
                          const partner = mockPartners.find(p => p.id === partnerId);
                          return partner ? (
                            <div key={index}>{partner.companyName}</div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded shadow">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">タスク管理</h3>
                <Link
                  href={`/projects/${projectId}/tasks`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 relative inline-flex items-center"
                >
                  タスク詳細管理
                  {project.status === 'タスク割当' && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      !
                    </span>
                  )}
                </Link>
              </div>
            </div>
            <div className="p-4">
              {Object.entries(tasks).map(([phase, phaseTasks]) => {
                const isCompleted = phaseTasks.every(t => t.completed);
                const isCurrentPhase = phase === project.currentPhase;
                
                return (
                  <div key={phase} className="mb-4">
                    <h4 className="font-semibold mb-2">
                      {phase} 
                      {isCompleted && <span className="text-green-600">✓ 完了</span>}
                      {isCurrentPhase && !isCompleted && <span className="text-blue-600">● 進行中</span>}
                      {!isCompleted && !isCurrentPhase && <span className="text-gray-600">🔒 ロック中</span>}
                    </h4>
                    <div className="space-y-1 ml-4">
                      {phaseTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            disabled={!canEditProjectDetails() || !isCurrentPhase || task.completed}
                            onChange={() => alert('タスクを完了しました')}
                          />
                          <span className={task.completed ? 'line-through text-gray-500' : ''}>
                            {task.name}
                          </span>
                          {!task.completed && task.deadline && (
                            <span className="text-sm">
                              {new Date(task.deadline) <= new Date() ?
                                <span className="text-red-600">期限: 本日</span> :
                                <span className="text-orange-600">期限: {task.deadline}</span>
                              }
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-6 bg-white rounded shadow">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-bold">添付ファイル</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>📄 契約書.pdf</span>
                  <button className="text-blue-600 hover:underline">ダウンロード</button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>📄 施工計画書.pdf</span>
                  <button className="text-blue-600 hover:underline">ダウンロード</button>
                </div>
                <div className="flex items-center justify-between p-2 border rounded">
                  <span>📄 設計変更図面_20250104.pdf</span>
                  <button className="text-blue-600 hover:underline">ダウンロード</button>
                </div>
              </div>
              {canEditProjectDetails() && (
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  ＋ ファイルアップロード
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}