-- -----------------------------------------------------------------------------
-- 파일명: 016_add_building_scale.sql
-- 설명: 건물 규모(지하 층수, 지상 층수)를 저장하기 위한 컬럼 추가
-- -----------------------------------------------------------------------------

-- 1. properties 테이블에 새로운 컬럼 추가
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS building_scale_underground VARCHAR(50), -- 지하 층수
ADD COLUMN IF NOT EXISTS building_scale_ground VARCHAR(50);      -- 지상 층수

-- 2. 컬럼 주석 추가
COMMENT ON COLUMN public.properties.building_scale_underground IS '건물 규모 (지하 층수)';
COMMENT ON COLUMN public.properties.building_scale_ground IS '건물 규모 (지상 층수)';
