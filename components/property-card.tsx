'use client';

/**
 * @file components/property-card.tsx
 * @description 단일 매물 정보를 깔끔한 카드 형태로 표시하는 반응형 UI 컴포넌트
 */

import React from 'react';
import { MapPin, Maximize2, Tag, Building2 } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertyCardProps {
  /** 매물 데이터 객체 */
  property: Property;
  /** 매물 카드 클릭 시 모달 열기를 위한 콜백 함수 */
  onClick: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  // 대표 이미지 (이미지 배열의 첫 번째 항목 사용, 없을 경우 샘플 이미지 적용)
  const mainImage = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

  return (
    <div
      onClick={() => onClick(property)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col transform hover:-translate-y-1"
    >
      {/* 1. 매물 대표 이미지 영역 */}
      <div className="relative w-full h-56 overflow-hidden bg-slate-100">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* 매물 종류 뱃지 (상단 좌측) */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
          <Building2 className="w-3.5 h-3.5" />
          <span>{property.property_type}</span>
        </div>

        {/* 이미지 개수 표시 뱃지 (상단 우측) */}
        {property.images && property.images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg">
            +{property.images.length}장
          </div>
        )}
      </div>

      {/* 2. 매물 카드 상세 내용 영역 */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* 가격 정보 (포인트 컬러 적용) */}
          <div className="text-xl font-bold text-slate-900 tracking-tight mb-2">
            {property.price}
          </div>

          {/* 매물 제목 */}
          <h3 className="text-base font-semibold text-slate-800 line-clamp-1 group-hover:text-slate-900 transition-colors mb-3">
            {property.title}
          </h3>

          {/* 간략한 위치 정보 */}
          <div className="flex items-center text-sm text-slate-500 gap-1.5 mb-4">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* 하단 요약 스펙 정보 (면적 & 용도지역) */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{property.area_size}</span>
          </div>
          {property.zoning_info && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[120px]">{property.zoning_info}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
