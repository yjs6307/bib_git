-- 준공년도(build_year) 컬럼 추가
-- 이 쿼리를 Supabase의 SQL Editor에서 실행해주세요.

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS build_year text;

COMMENT ON COLUMN public.properties.build_year IS '준공년도';
