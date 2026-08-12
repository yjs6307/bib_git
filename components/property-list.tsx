'use client';

/**
 * @file components/property-list.tsx
 * @description 매물 검색, 카테고리 필터링 및 그리드 뷰를 담당하는 메인 매물 리스트 컴포넌트
 */

import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Building2 } from 'lucide-react';
import { Property } from '@/types/property';
import { PropertyCard } from './property-card';
import { PropertyDetailModal } from './property-detail-modal';

interface PropertyListProps {
  /** Supabase 또는 서버에서 전달받은 전체 매물 목록 */
  initialProperties: Property[];
}

export const PropertyList: React.FC<PropertyListProps> = ({ initialProperties }) => {
  // 선택된 카테고리 필터 상태
  const [selectedType, setSelectedType] = useState<string>('전체');
  // 검색어 입력 상태
  const [searchQuery, setSearchQuery] = useState<string>('');
  // 상세보기 모달에 표시할 매물 객체 상태 (null이면 모달 닫힘)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // 이용 가능한 카테고리 목록 추출
  const categories = useMemo(() => {
    const types = new Set(initialProperties.map((p) => p.property_type));
    return ['전체', ...Array.from(types)];
  }, [initialProperties]);

  // 필터링 및 검색된 매물목록 계산
  const filteredProperties = useMemo(() => {
    return initialProperties.filter((property) => {
      // 1. 카테고리 필터 체크
      const matchesType = selectedType === '전체' || property.property_type === selectedType;
      
      // 2. 검색어 체크 (제목 또는 위치)
      const matchesQuery =
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.price.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesQuery;
    });
  }, [initialProperties, selectedType, searchQuery]);

  return (
    <div className="space-y-8">
      {/* 1. 검색 및 필터링 헤더 영역 */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* 검색창 Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="매물명, 위치, 가격 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 등록된 총 매물 수 표시 */}
          <div className="text-sm font-medium text-slate-500 self-end md:self-center">
            총 <span className="text-slate-900 font-bold">{filteredProperties.length}</span>개 매물
          </div>
        </div>

        {/* 카테고리 필터 뱃지 버튼 그룹 */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-thin">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedType(category)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                selectedType === category
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 매물 그리드 리스트 영역 */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={(item) => setSelectedProperty(item)}
            />
          ))}
        </div>
      ) : (
        /* 데이터가 없을 때 표시되는 Empty State */
        <div className="bg-white py-16 px-4 rounded-3xl border border-slate-100 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">검색 조건과 일치하는 매물이 없습니다.</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            검색어를 변경하거나 다른 카테고리 필터를 선택해 보세요.
          </p>
        </div>
      )}

      {/* 3. 선택된 매물 상세보기 모달 팝업 */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
};
