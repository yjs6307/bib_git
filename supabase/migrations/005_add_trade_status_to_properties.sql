-- -----------------------------------------------------------------------------
-- 파일명: 005_add_trade_status_to_properties.sql
-- 설명: properties 테이블에 진행 상태 컬럼(trade_status) 추가 SQL
-- -----------------------------------------------------------------------------

-- 1. properties 테이블에 trade_status 컬럼 추가 (기본값: '매매진행중')
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS trade_status VARCHAR(50) DEFAULT '매매진행중';

COMMENT ON COLUMN public.properties.trade_status IS '매물 진행 상태 (매입준비중, 계약, 인테리어중, 매매진행중, 매매완료)';

-- 2. Supabase API 스키마 캐시 새로고침
NOTIFY pgrst, 'reload schema';
