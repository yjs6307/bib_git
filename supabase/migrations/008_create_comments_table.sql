-- -----------------------------------------------------------------------------
-- 008_create_comments_table.sql
-- 매물 실시간 댓글 및 회원 문의 수용 테이블(property_comments) 생성 SQL
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.property_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    user_name VARCHAR(100) NOT NULL,
    user_level INT DEFAULT 1,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) 및 접근 정책 설정
ALTER TABLE public.property_comments ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 삭제하여 중복 에러(42710) 방지
DROP POLICY IF EXISTS "Allow read for all users" ON public.property_comments;
DROP POLICY IF EXISTS "Allow insert for all users" ON public.property_comments;
DROP POLICY IF EXISTS "Allow delete for all users" ON public.property_comments;

CREATE POLICY "Allow read for all users" ON public.property_comments
    FOR SELECT USING (true);

CREATE POLICY "Allow insert for all users" ON public.property_comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow delete for all users" ON public.property_comments
    FOR DELETE USING (true);

-- 스키마 갱신 알림
NOTIFY pgrst, 'reload schema';
