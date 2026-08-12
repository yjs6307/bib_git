/**
 * @file app/layout.tsx
 * @description Next.js App Router Root Layout 컴포넌트
 */

import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '부익부 부동산 매물 관리 메인 | BU-IK-BU Real Estate',
  description: '아파트, 상가, 지식산업센터 등 신뢰할 수 있는 매물 정보를 한눈에 조회하세요.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css"
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
