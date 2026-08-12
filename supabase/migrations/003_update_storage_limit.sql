-- -----------------------------------------------------------------------------
-- 파일명: 003_update_storage_limit.sql
-- 설명: Supabase Storage property-images 버킷의 업로드 용량 한도 확장 SQL
-- -----------------------------------------------------------------------------

-- property-images 버킷의 파일 크기 제한을 50MB(52,428,800 bytes)로 대폭 확장
UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'property-images';

-- 갱신 알림
NOTIFY pgrst, 'reload schema';
