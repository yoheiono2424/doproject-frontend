'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/app/components/Sidebar';
import { useAuthStore } from '@/app/lib/store';
import { mockProjects } from '@/app/lib/mockData';
import { usePermissions } from '@/app/lib/usePermissions';

export default function ProjectsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { canEditProjectDetails } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterContract, setFilterContract] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const filteredProjects = mockProjects
    .filter(project => {
      const matchesSearch = searchTerm === '' ||
        project.projectName.includes(searchTerm) ||
        project.clientName.includes(searchTerm) ||
        project.orderNo.includes(searchTerm);

      const matchesType = filterType === 'all' || project.type === filterType;
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      const matchesContract = filterContract === 'all' ||
        (filterContract === '元請' && project.contractType === '元') ||
        (filterContract === '下請' && project.contractType === '下');

      return matchesSearch && matchesType && matchesStatus && matchesContract;
    })
    // 【v2.26】ステータスによる並び順制御：タスク割当 → 進行中 → 完了済み
    .sort((a, b) => {
      const getPriority = (status: string) => {
        if (status === 'タスク割当') return 1;
        if (status === '完了') return 3;
        return 2; // 施工中、契約済、未着手など
      };
      return getPriority(a.status) - getPriority(b.status);
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="content-area">
        <div className="bg-white shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">案件一覧</h2>
            {canEditProjectDetails() && (
              <Link
                href="/projects/new"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ＋ 新規案件登録
              </Link>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-white rounded shadow">
            <div className="p-4 border-b">
              <div className="flex gap-4">
                <select
                  className="border rounded px-3 py-1"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">全ての種別</option>
                  <option value="機械">機械</option>
                  <option value="電気">電気</option>
                  <option value="鋼造">鋼造</option>
                  <option value="通信">通信</option>
                  <option value="納品">納品</option>
                  <option value="管工事">管工事</option>
                  <option value="その他">その他</option>
                </select>
                <select 
                  className="border rounded px-3 py-1"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">全てのステータス</option>
                  <option value="契約済">契約</option>
                  <option value="着工準備">着工準備</option>
                  <option value="施工中">施工中</option>
                  <option value="竣工">竣工</option>
                </select>
                <select 
                  className="border rounded px-3 py-1"
                  value={filterContract}
                  onChange={(e) => setFilterContract(e.target.value)}
                >
                  <option value="all">元請/下請</option>
                  <option value="元請">元請</option>
                  <option value="下請">下請</option>
                </select>
                <input 
                  type="text" 
                  placeholder="検索..." 
                  className="border rounded px-3 py-1 flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">受注No</th>
                  <th className="p-2 text-left">客先名</th>
                  <th className="p-2 text-left">件名</th>
                  <th className="p-2 text-center">種別</th>
                  <th className="p-2 text-center">元/下</th>
                  <th className="p-2 text-center">進捗</th>
                  <th className="p-2 text-center">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr 
                    key={project.id}
                    className={`border-b hover:bg-gray-50 cursor-pointer ${project.isCorins ? 'corins' : ''}`}
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <td className="p-2">{project.orderNo}</td>
                    <td className="p-2">{project.clientName}</td>
                    <td className="p-2">{project.projectName}</td>
                    <td className="p-2 text-center">
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
                    <td className="p-2 text-center">
                      <span className={`status-badge ${
                        project.contractType === '元' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {project.contractType}
                      </span>
                    </td>
                    <td className="p-2 text-center">{project.progress}%</td>
                    <td className="p-2 text-center">
                      <span className={`status-badge ${
                        project.status === 'タスク割当' ? 'bg-orange-100 text-orange-700' :
                        project.status === '施工中' ? 'bg-blue-100 text-blue-700' :
                        project.status === '契約済' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 text-sm text-gray-600">
              ※ 黄色背景：CORINS対象案件（500万円以上）
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}