-- 매물 조건(conditions) 및 옵션(options) 항목 저장을 위한 배열 컬럼 추가
-- 이 쿼리를 Supabase의 SQL Editor에서 실행해주세요.

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS conditions text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS options text[] DEFAULT '{}'::text[];

-- 설명 주석 추가
COMMENT ON COLUMN public.properties.conditions IS '매물조건 목록 (예: 즉시입주, 엘리베이터 등)';
COMMENT ON COLUMN public.properties.options IS '매물옵션 목록 (예: 에어컨, 세탁기 등)';
