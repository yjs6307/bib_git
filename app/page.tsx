/**
 * @file app/page.tsx
 * @description 부동산 매물 리스트 메인 메인 페이지 (서버/클라이언트 연동)
 */

import React from 'react';
import { PropertyList } from '@/components/property-list';
import { Navbar } from '@/components/navbar';
import { Property } from '@/types/property';

// -----------------------------------------------------------------------------
// 초기 개발 및 시연용 샘플 매물 데모 데이터 (Supabase 연동 전 기본 보장 데이터)
// -----------------------------------------------------------------------------
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: '강남구 역삼동 신축 프라임 메디컬/오피스 타워 상가',
    property_type: '상가',
    location: '서울특별시 강남구 역삼동 824-1',
    price: '매매 45억원 (보증금 2억/월 1,500만)',
    area_size: '공급 330.5㎡ / 전용 214.8㎡ (100평/65평)',
    zoning_info: '중심상업지역',
    description: `역삼역 도보 3분 거리의 가시성 및 접근성이 매우 뛰어난 신축 타워 상가입니다.\n
- 병의원, 클리닉, 고급 브런치 카페 및 리테일 프랜차이즈 강추\n
- 층고 4.5m로 개방감 우수하며 자주식 주차 10대 가능\n
- 든든한 안정적 임대수익률 (연 4.5% 예상)`,
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: '성수동 지식산업센터 펜트하우스형 지식공장 & 전용 테라스',
    property_type: '공장/산업용지',
    location: '서울특별시 성동구 성수동2가 289',
    price: '매매 28억원',
    area_size: '공급 297.5㎡ / 전용 181.8㎡',
    zoning_info: '준공업지역',
    description: `성수 IT 밸리 중심에 위치한 최고층 지식산업센터 매물입니다.\n
- IT, IT+콘텐츠, 스튜디오, 디자인 사옥용으로 최적\n
- 화물 엘리베이터 직접 연결 및 넉넉한 층고 확보\n
- 전용 야외 루프탑 테라스 포함`,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: '한남동 UN빌리지 초입 최고급 럭셔리 하이엔드 아파트',
    property_type: '아파트',
    location: '서울특별시 용산구 한남동 11-1',
    price: '매매 75억원',
    area_size: '공급 264.4㎡ / 전용 220.1㎡',
    zoning_info: '제1종전용주거지역',
    description: `파노라마 한강뷰가 일품인 최상급 주거 공간입니다.\n
- 철저한 보안 및 24시간 단지 관리 시스템 제공\n
- 최상급 천연 대리석 인테리어 및 최고급 가전 풀옵션 빌트인\n
- 주차 가구당 3대 지원`,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: '판교 테크노밸리 인근 오피스텔 통매매 / 기업 사옥 추천',
    property_type: '오피스텔',
    location: '경기도 성남시 분당구 삼평동 680',
    price: '매매 120억원',
    area_size: '공급 1,320.0㎡ / 전용 950.0㎡',
    zoning_info: '중심상업지역',
    description: `판교역 인근 대기업 사옥 또는 연수원용으로 적합한 오피스 건물입니다.\n
- 신분당선 판교역 도보권, 수도권 제1순환고속도로 진출입 용이\n
- 최신 빌딩제어 시스템 및 EV 충전소 완비`,
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
    ],
    created_at: new Date().toISOString(),
  }
];

export default async function HomePage() {
  // 실제 Supabase 연결 시 다음과 같이 Supabase client에서 동적으로 데이터를 불러옵니다:
  /*
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
  */
  const properties = MOCK_PROPERTIES;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-slate-900 selection:text-white">
      {/* 1. 상단 글로벌 네비게이션 헤더 */}
      <Navbar />

      {/* 2. 히어로(Hero) 안내 섹션 */}
      <section className="bg-white border-b border-slate-100 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-600 text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              프리미엄 검증 매물
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              가장 신뢰할 수 있는 <br />
              부동산 매물 정보를 만나보세요.
            </h1>
            <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
              상가, 아파트, 지식산업센터부터 사업용 용지까지 체계적으로 검증된 자산 정보를 실시간으로 확인하실 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 3. 메인 매물 리스트 및 필터 섹션 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PropertyList initialProperties={properties} />
      </main>

      {/* 4. 푸터(Footer) 영역 */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-20 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 BU-IK-BU Real Estate Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
