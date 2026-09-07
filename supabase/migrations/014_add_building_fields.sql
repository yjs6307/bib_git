-- -----------------------------------------------------------------------------
-- 파일명: 014_add_building_fields.sql
-- 설명: 건물 매물 전용 정보(대지, 건평, 연면적 등) 및 현 임차현황 데이터를 저장하기 위한 컬럼 추가
-- -----------------------------------------------------------------------------

-- 1. properties 테이블에 새로운 컬럼 추가
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS land_area VARCHAR(100),            -- 대지
ADD COLUMN IF NOT EXISTS building_area VARCHAR(100),        -- 건평
ADD COLUMN IF NOT EXISTS total_floor_area VARCHAR(100),     -- 연면적
ADD COLUMN IF NOT EXISTS heating_system VARCHAR(100),       -- 난방방식
ADD COLUMN IF NOT EXISTS building_structure VARCHAR(100),   -- 건축구조
ADD COLUMN IF NOT EXISTS completion_year VARCHAR(100),      -- 준공년도
ADD COLUMN IF NOT EXISTS building_type VARCHAR(100),        -- 건물유형
ADD COLUMN IF NOT EXISTS tenancy_status JSONB DEFAULT '[]'::jsonb; -- 현 임차현황 배열 (층별, 호수, 방수, 화장실수, 보증금, 월세, 관리비)

-- 2. 컬럼 주석 추가
COMMENT ON COLUMN public.properties.land_area IS '대지 면적';
COMMENT ON COLUMN public.properties.building_area IS '건평 면적';
COMMENT ON COLUMN public.properties.total_floor_area IS '연면적';
COMMENT ON COLUMN public.properties.heating_system IS '난방 방식';
COMMENT ON COLUMN public.properties.building_structure IS '건축 구조';
COMMENT ON COLUMN public.properties.completion_year IS '준공 년도';
COMMENT ON COLUMN public.properties.building_type IS '건물 유형';
COMMENT ON COLUMN public.properties.tenancy_status IS '현 임차현황 데이터 배열 (JSONB)';
