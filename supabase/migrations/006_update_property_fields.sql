-- -----------------------------------------------------------------------------
-- 파일명: 006_update_property_fields.sql
-- 설명: properties 테이블에 빌라 전용 세부 항목, 층수, 투자/수익 계산 항목 및 
--       참여 회원 명단 컬럼 추가 SQL
-- -----------------------------------------------------------------------------

-- 1. 신규 컬럼 추가
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rooms INT DEFAULT 0,                        -- 방 수 (빌라 전용)
ADD COLUMN IF NOT EXISTS bathrooms INT DEFAULT 0,                    -- 화장실 수 (빌라 전용)
ADD COLUMN IF NOT EXISTS floor_info VARCHAR(50),                     -- 층수 / 총층수 (예: 3층 / 5층)
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(15, 0) DEFAULT 0,    -- 매입가 (원)
ADD COLUMN IF NOT EXISTS expected_cost NUMERIC(15, 0) DEFAULT 0,     -- 예상비용 (원)
ADD COLUMN IF NOT EXISTS expected_selling_price NUMERIC(15, 0) DEFAULT 0, -- 예상매매가 (원)
ADD COLUMN IF NOT EXISTS expected_profit NUMERIC(15, 0) DEFAULT 0,   -- 예상수익 (예상매매가 - 매입가 - 예상비용)
ADD COLUMN IF NOT EXISTS participant_members TEXT;                  -- 참여 회원 명단

-- 주석 설정
COMMENT ON COLUMN public.properties.rooms IS '방 수';
COMMENT ON COLUMN public.properties.bathrooms IS '화장실 수';
COMMENT ON COLUMN public.properties.floor_info IS '층수 / 총층수';
COMMENT ON COLUMN public.properties.purchase_price IS '매입가';
COMMENT ON COLUMN public.properties.expected_cost IS '예상비용';
COMMENT ON COLUMN public.properties.expected_selling_price IS '예상매매가';
COMMENT ON COLUMN public.properties.expected_profit IS '예상수익 (매매가 - 매입가 - 예상비용)';
COMMENT ON COLUMN public.properties.participant_members IS '참여 회원 명단';

-- 2. Supabase API 스키마 캐시 새로고침
NOTIFY pgrst, 'reload schema';
