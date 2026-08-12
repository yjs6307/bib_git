/**
 * @file types/property.ts
 * @description 부동산 매물(Property) 데이터 인터페이스 정의 파일
 */

export interface Property {
  /** 매물 고유 식별자 (UUID) */
  id: string;
  
  /** 매물 제목 (예: "역삼동 신축 메디컬 타워 상가 임대") */
  title: string;
  
  /** 매물 종류 (예: "아파트", "상가", "공장/산업용지", "오피스텔" 등) */
  property_type: string;
  
  /** 소재지/위치 (예: "서울특별시 강남구 역삼동") */
  location: string;
  
  /** 가격/거래 조건 (예: "매매 25억원", "보증금 1억 / 월 800만원") */
  price: string;
  
  /** 공급/전용 면적 (예: "공급 165㎡ / 전용 110㎡") */
  area_size: string;
  
  /** 용도지역/지구 (예: "제2종일반주거지역", "중심상업지역") */
  zoning_info?: string;
  
  /** 매물 상세 정보 및 특장점 설명 */
  description?: string;
  
  /** Supabase Storage에 업로드된 이미지 URL 목록 */
  images: string[];
  
  /** 등록 일시 (ISO string 형식) */
  created_at: string;
}
