import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 本番ビルド時のESLintエラーを警告にダウングレード
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 本番ビルド時のTypeScriptエラーを無視（開発時は型チェック推奨）
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
