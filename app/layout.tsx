import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Do Project 進捗管理システム",
  description: "建設工事の進捗管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
