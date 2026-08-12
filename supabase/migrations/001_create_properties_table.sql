-- -----------------------------------------------------------------------------
-- 파일명: 001_create_properties_table.sql
-- 설명: 부동산 매물 정보 테이블 생성 및 보안 RLS(Row Level Security) 정책 설정
-- -----------------------------------------------------------------------------

-- 1. properties 테이블 생성
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,            -- 매물 제목
    property_type VARCHAR(100) NOT NULL,    -- 매물 종류 (예: 아파트, 상가, 공장/산업용지, 오피스텔 등)
    location VARCHAR(255) NOT NULL,         -- 소재지 (예: 서울특별시 강남구 역삼동)
    price VARCHAR(100) NOT NULL,            -- 매매가/임대가 (예: 매매 15억원, 보증금 1억/월 500만원)
    area_size VARCHAR(100) NOT NULL,        -- 공급/전용 면적 (예: 공급 110㎡ / 전용 84㎡)
    zoning_info VARCHAR(100),               -- 용도지역/지구 (예: 제2종일반주거지역, 중심상업지역)
    description TEXT,                        -- 상세 설명 및 특장점
    images TEXT[] DEFAULT '{}',             -- Supabase Storage에 저장된 이미지 URL 배열
    created_at TIMESTAMPTZ DEFAULT now()   -- 등록 일시
);

-- 테이블 및 컬럼 주석 설정
COMMENT ON TABLE public.properties IS '부동산 매물 정보를 관리하는 테이블';
COMMENT ON COLUMN public.properties.id IS '매물 고유 식별자 (UUID)';
COMMENT ON COLUMN public.properties.title IS '매물 제목';
COMMENT ON COLUMN public.properties.property_type IS '매물 종류';
COMMENT ON COLUMN public.properties.location IS '매물 위치/소재지';
COMMENT ON COLUMN public.properties.price IS '거래 금액 정보';
COMMENT ON COLUMN public.properties.area_size IS '면적 정보';
COMMENT ON COLUMN public.properties.zoning_info IS '용도지역 정보';
COMMENT ON COLUMN public.properties.description IS '상세 설명';
COMMENT ON COLUMN public.properties.images IS '매물 이미지 URL 리스트';
COMMENT ON COLUMN public.properties.created_at IS '등록일시';

-- 2. Row Level Security (RLS) 활성화
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 정의
-- [정책 1] 누구나 매물 리스트 조회 가능 (SELECT)
CREATE POLICY "Public Read Access"
ON public.properties FOR SELECT TO public USING (true);

-- [정책 2] 누구나 매물 등록 테스트 가능 (INSERT)
CREATE POLICY "Public Insert Access"
ON public.properties FOR INSERT TO public WITH CHECK (true);

-- [정책 3] 누구나 매물 수정 가능 (UPDATE)
CREATE POLICY "Public Update Access"
ON public.properties FOR UPDATE TO public USING (true) WITH CHECK (true);

-- [정책 4] 누구나 매물 삭제 가능 (DELETE)
CREATE POLICY "Public Delete Access"
ON public.properties FOR DELETE TO public USING (true);

-- 4. Supabase Storage 버킷 생성 및 RLS 설정 (이미지 저장 전용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Storage Read Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'property-images');
CREATE POLICY "Admin Storage Insert Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');
