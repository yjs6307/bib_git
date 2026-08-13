-- -----------------------------------------------------------------------------
-- 007_add_property_number_and_date.sql
-- 매물 테이블에 매물 고유 번호(property_number) 및 등록일자(registration_date) 컬럼 추가
-- -----------------------------------------------------------------------------

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS registration_date DATE DEFAULT CURRENT_DATE;

-- 스키마 캐시 갱신 알림
NOTIFY pgrst, 'reload schema';
