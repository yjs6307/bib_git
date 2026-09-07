-- -----------------------------------------------------------------------------
-- 파일명: 015_add_building_financial_fields.sql
-- 설명: 건물 매물 전용 재무 항목 및 특이사항을 저장하기 위한 컬럼 추가
-- -----------------------------------------------------------------------------

-- 1. properties 테이블에 새로운 컬럼 추가
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS building_sale_price VARCHAR(100),        -- 매매가
ADD COLUMN IF NOT EXISTS building_deposit VARCHAR(100),           -- 보증금
ADD COLUMN IF NOT EXISTS building_monthly_rent VARCHAR(100),      -- 월세금액
ADD COLUMN IF NOT EXISTS building_loan VARCHAR(100),              -- 융자금액
ADD COLUMN IF NOT EXISTS building_invest_cash VARCHAR(100),       -- 투자현금
ADD COLUMN IF NOT EXISTS building_move_in_cash VARCHAR(100),      -- 입주금
ADD COLUMN IF NOT EXISTS building_special_notes TEXT;             -- 특이사항

-- 2. 컬럼 주석 추가
COMMENT ON COLUMN public.properties.building_sale_price IS '건물 매매가';
COMMENT ON COLUMN public.properties.building_deposit IS '건물 보증금';
COMMENT ON COLUMN public.properties.building_monthly_rent IS '건물 월세금액';
COMMENT ON COLUMN public.properties.building_loan IS '건물 융자금액';
COMMENT ON COLUMN public.properties.building_invest_cash IS '건물 투자현금';
COMMENT ON COLUMN public.properties.building_move_in_cash IS '건물 입주금';
COMMENT ON COLUMN public.properties.building_special_notes IS '건물 특이사항';
