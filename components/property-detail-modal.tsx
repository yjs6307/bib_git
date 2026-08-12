'use client';

/**
 * @file components/property-detail-modal.tsx
 * @description 매물 클릭 시 배경 블러 처리와 함께 팝업되는 모달 상세보기 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { X, MapPin, Maximize2, Tag, Calendar, Building2, ChevronLeft, ChevronRight, Share2, PhoneCall } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertyDetailModalProps {
  /** 선택된 매물 데이터 (null이면 모달이 닫힘) */
  property: Property | null;
  /** 모달 닫기 콜백 함수 */
  onClose: () => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({ property, onClose }) => {
  // 현재 갤러리 슬라이드 인덱스 상태
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 모달이 변경될 때 갤러리 인덱스 초기화
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [property]);

  // ESC 키 클릭 시 모달 닫기 이벤트 추가
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!property) return null;

  // 이미지 목록 (없을 경우 기본 대체 이미지)
  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80'];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* 1. 백드롭 블러 배경 (클릭 시 모달 닫힘) */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* 2. 모달 컨텐츠 본체 */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[90vh] transition-all transform animate-scale-up">
        {/* 상단 헤더 & 닫기 버튼 */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-slate-900 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {property.property_type}
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              등록일: {new Date(property.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: property.title, url: window.location.href });
                } else {
                  alert('URL이 복사되었습니다.');
                }
              }}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
              title="공유하기"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              aria-label="닫기"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 3. 모달 내부 스크롤 가능 컨텐츠 영역 */}
        <div className="overflow-y-auto p-6 space-y-8">
          {/* 이미지 갤러리 슬라이더 */}
          <div className="relative w-full h-[320px] sm:h-[450px] bg-slate-900 rounded-2xl overflow-hidden group">
            <img
              src={images[currentImageIndex]}
              alt={`${property.title} - 이미지 ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* 좌우 네비게이션 버튼 (이미지가 2개 이상일 때) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-transform transform active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-transform transform active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* 이미지 인덱스 인디케이터 */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* 썸네일 그리드 (이미지가 2개 이상일 경우 하단에 표시) */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    idx === currentImageIndex ? 'border-slate-900 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="썸네일" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* 핵심 정보 요약 섹션 */}
          <div className="space-y-4">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {property.price}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
                {property.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{property.location}</span>
              </div>
            </div>
          </div>

          {/* 상세 스펙 하이라이트 카드리스트 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <Maximize2 className="w-4 h-4 text-slate-400" />
                <span>공급 / 전용 면적</span>
              </div>
              <div className="text-base font-semibold text-slate-800">
                {property.area_size}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <Tag className="w-4 h-4 text-slate-400" />
                <span>용도지역 / 지구</span>
              </div>
              <div className="text-base font-semibold text-slate-800">
                {property.zoning_info || '정보 없음'}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>매물 등록일</span>
              </div>
              <div className="text-base font-semibold text-slate-800">
                {new Date(property.created_at).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>

          {/* 상세 설명 내용 영역 */}
          {property.description && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">매물 상세 설명</h3>
              <div className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                {property.description}
              </div>
            </div>
          )}
        </div>

        {/* 4. 하단 액션 하단바 */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">문의 가능 매물</span>
            <span className="text-lg font-bold text-slate-900">{property.price}</span>
          </div>

          <a
            href="tel:02-1234-5678"
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-2xl shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PhoneCall className="w-4 h-4" />
            <span>매물 문의하기</span>
          </a>
        </div>
      </div>
    </div>
  );
};
