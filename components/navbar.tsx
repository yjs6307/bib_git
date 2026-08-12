'use client';

/**
 * @file components/navbar.tsx
 * @description 웹 애플리케이션 상단 브랜드 로고 및 로그인/관리자 메뉴 네비게이션 바
 */

import React from 'react';
import { Building, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  /** 현재 사용자 인증 여부 (테스트용/실제 관리자) */
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isAdmin = false }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
        {/* 브랜드 로고 영역 */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-900/20">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight block leading-none">
              BU-IK-BU
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Real Estate Asset Management
            </span>
          </div>
        </div>

        {/* 오른쪽 우측 메뉴 (Admin 정보 및 로그인 버튼) */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>관리자 전용 모드</span>
            </div>
          ) : (
            <button
              onClick={() => alert('관리자 로그인 페이지로 이동합니다.')}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>Admin 로그인</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
