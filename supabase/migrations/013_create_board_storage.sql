-- -----------------------------------------------------------------------------
-- 파일명: 013_create_board_storage.sql
-- 설명: 게시판 첨부파일 저장을 위한 Storage Bucket 생성 및 권한 설정
-- 참고: Storage 기능을 사용하려면 Supabase 콘솔에서 먼저 Storage 기능을 활성화해야 할 수 있습니다.
-- -----------------------------------------------------------------------------

-- 1. board_files 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public)
VALUES ('board_files', 'board_files', true)
ON CONFLICT (id) DO NOTHING;

-- 2. board_files 읽기 권한 설정 (누구나 다운로드 및 읽기 가능)
CREATE POLICY "Public Read Access for board_files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'board_files');

-- 3. board_files 업로드 권한 설정 (누구나 업로드 가능하게 열어둠)
CREATE POLICY "Public Insert Access for board_files"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'board_files');

-- 4. board_files 수정 권한 설정
CREATE POLICY "Public Update Access for board_files"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'board_files');

-- 5. board_files 삭제 권한 설정
CREATE POLICY "Public Delete Access for board_files"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'board_files');
