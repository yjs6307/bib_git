/**
 * @file lib/supabase.ts
 * @description Supabase 데이터베이스 및 스토리지 연동을 위한 클라이언트 설정
 */

import { createClient } from '@supabase/supabase-js';
import { Property } from '@/types/property';

// 환경 변수에서 Supabase URL과 Anon Key를 읽어옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * 프론트엔드 및 서버에서 사용할 Supabase 클라이언트 인스턴스
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 데이터베이스 타입 보조 유틸리티
 */
export type Database = {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Omit<Property, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Property, 'id'>>;
      };
    };
  };
};
