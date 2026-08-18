-- -----------------------------------------------------------------------------
-- 파일명: 012_add_file_to_boards.sql
-- 설명: boards 테이블에 파일 첨부 관련 컬럼 2개 추가
-- -----------------------------------------------------------------------------

ALTER TABLE public.boards 
ADD COLUMN IF NOT EXISTS attached_file_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS attached_file_name VARCHAR(255);

COMMENT ON COLUMN public.boards.attached_file_url IS '업로드된 파일의 Storage 공개 주소';
COMMENT ON COLUMN public.boards.attached_file_name IS '업로드된 원본 파일명';
