-- -----------------------------------------------------------------------------
-- 파일명: 004_add_youtube_url_to_properties.sql
-- 설명: properties 테이블에 유튜브 영상 URL 컬럼(youtube_url) 추가 SQL
-- -----------------------------------------------------------------------------

-- 1. properties 테이블에 youtube_url 컬럼 추가
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(255);

COMMENT ON COLUMN public.properties.youtube_url IS '유튜브 매물 홍보 영상 URL';

-- 2. Supabase API 스키마 캐시 새로고침
NOTIFY pgrst, 'reload schema';
