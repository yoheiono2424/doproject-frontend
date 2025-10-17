'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const success = await login(username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('ユーザー名またはパスワードが正しくありません');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Do Project 進捗管理システム
        </h1>
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">ユーザーID</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">パスワード</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">{error}</div>
          )}
          <button
            type="button"
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            ログイン
          </button>
        </div>

        {/* テスト用アカウント情報 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm font-medium text-gray-600 mb-3">
            ─── テスト用アカウント ───
          </p>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <p className="font-bold text-blue-900 mb-1">【部長クラス以上（高権限）】</p>
              <p className="text-gray-700">ID: bucho@example.com</p>
              <p className="text-gray-700">PW: password123</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-bold text-gray-900 mb-1">【一般ユーザー】</p>
              <p className="text-gray-700">ID: ippan@example.com</p>
              <p className="text-gray-700">PW: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
