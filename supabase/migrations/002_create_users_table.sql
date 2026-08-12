-- -----------------------------------------------------------------------------
-- 파일명: 002_create_users_table.sql
-- 설명: 회원 승인제 및 10단계 등급 / 권한 관리를 위한 profiles 테이블 생성 SQL
-- -----------------------------------------------------------------------------

-- 1. profiles 회원 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,       -- 회원 이메일 (아이디)
    password VARCHAR(255) NOT NULL,          -- 비밀번호
    name VARCHAR(100) NOT NULL,              -- 회원 이름 / 상호
    phone VARCHAR(50) NOT NULL,              -- 연락처 (핸드폰 번호)
    role VARCHAR(50) DEFAULT 'member',       -- 역할: 'member'(일반), 'manager'(매니저), 'admin'(최고관리자)
    level INT DEFAULT 1,                     -- 회원 등급 (1단계 ~ 10단계)
    status VARCHAR(50) DEFAULT 'pending',    -- 회원 상태: 'pending'(승인대기), 'approved'(승인완료), 'rejected'(거절)
    can_create BOOLEAN DEFAULT false,        -- 매물 등록 권한 유무
    can_edit BOOLEAN DEFAULT false,          -- 매물 수정 권한 유무
    can_delete BOOLEAN DEFAULT false,        -- 매물 삭제 권한 유무
    created_at TIMESTAMPTZ DEFAULT now()    -- 가입 일시
);

-- 테이블 및 컬럼 주석 설정
COMMENT ON TABLE public.profiles IS '부익부 회원 프로필 및 10단계 등급/권한 관리 테이블';
COMMENT ON COLUMN public.profiles.level IS '1단계(준회원/대기) ~ 10단계(최고관리자)';
COMMENT ON COLUMN public.profiles.status IS 'pending(승인대기), approved(승인완료), rejected(가입거절)';

-- 2. Row Level Security (RLS) 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Profiles Read Access" ON public.profiles;
DROP POLICY IF EXISTS "Public Profiles Insert Access" ON public.profiles;
DROP POLICY IF EXISTS "Public Profiles Update Access" ON public.profiles;
DROP POLICY IF EXISTS "Public Profiles Delete Access" ON public.profiles;

-- RLS 정책: 누구나 프로필 조회 가능 (로그인/승인 확인용)
CREATE POLICY "Public Profiles Read Access" ON public.profiles FOR SELECT TO public USING (true);
-- RLS 정책: 누구나 신규 회원가입 가능 (INSERT)
CREATE POLICY "Public Profiles Insert Access" ON public.profiles FOR INSERT TO public WITH CHECK (true);
-- RLS 정책: 누구나 프로필 정보/승인 상태 변경 가능 (UPDATE)
CREATE POLICY "Public Profiles Update Access" ON public.profiles FOR UPDATE TO public USING (true) WITH CHECK (true);
-- RLS POLICY: 누구나 삭제 가능 (DELETE)
CREATE POLICY "Public Profiles Delete Access" ON public.profiles FOR DELETE TO public USING (true);

-- 3. 초기 최고 관리자 계정 생성 (비밀번호: admin1234, level: 10, status: approved)
INSERT INTO public.profiles (email, password, name, phone, role, level, status, can_create, can_edit, can_delete)
VALUES (
    'admin@buikbu.com', 
    'admin1234', 
    '최고 관리자', 
    '010-8917-8383', 
    'admin', 
    10, 
    'approved', 
    true, 
    true, 
    true
)
ON CONFLICT (email) DO NOTHING;

-- 4. Supabase API 스키마 캐시 새로고침
NOTIFY pgrst, 'reload schema';
