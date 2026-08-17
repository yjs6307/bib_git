-- -----------------------------------------------------------------------------
-- 파일명: 011_create_boards_table.sql
-- 설명: 공지사항 및 정보마당 게시글 저장을 위한 테이블 생성 및 권한 설정
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,          -- 'notice' (공지사항), 'info' (정보마당)
    title VARCHAR(255) NOT NULL,            -- 게시글 제목
    content TEXT NOT NULL,                  -- 게시글 내용
    link_url VARCHAR(500),                  -- 외부 관련 링크 (선택)
    author_name VARCHAR(100),               -- 작성자 이름
    author_email VARCHAR(100),              -- 작성자 이메일
    created_at TIMESTAMPTZ DEFAULT now()    -- 작성 일시
);

-- 테이블 및 컬럼 주석 설정
COMMENT ON TABLE public.boards IS '게시판(공지사항, 정보마당) 정보를 관리하는 테이블';
COMMENT ON COLUMN public.boards.id IS '게시글 고유 식별자(UUID)';
COMMENT ON COLUMN public.boards.category IS '게시글 분류 (notice/info)';
COMMENT ON COLUMN public.boards.title IS '게시글 제목';
COMMENT ON COLUMN public.boards.content IS '게시글 상세 내용';
COMMENT ON COLUMN public.boards.link_url IS '관련 외부 링크';
COMMENT ON COLUMN public.boards.author_name IS '작성자 이름';
COMMENT ON COLUMN public.boards.author_email IS '작성자 이메일';
COMMENT ON COLUMN public.boards.created_at IS '작성일시';

-- Row Level Security (RLS) 활성화
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- RLS 정책 정의 (개발 및 테스트를 위해 일단 모든 접근 허용)
CREATE POLICY "Public Read Access on boards"
ON public.boards FOR SELECT TO public USING (true);

CREATE POLICY "Public Insert Access on boards"
ON public.boards FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Public Update Access on boards"
ON public.boards FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Public Delete Access on boards"
ON public.boards FOR DELETE TO public USING (true);
