-- 세부비용내역(cost_details) 컬럼 추가
-- 이 쿼리를 Supabase의 SQL Editor에서 실행해주세요.

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS cost_details text;

COMMENT ON COLUMN public.properties.cost_details IS '세부비용내역';
