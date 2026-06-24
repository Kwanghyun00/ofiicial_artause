-- community_posts에 공연 메타 정보 컬럼 추가
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS performance_end_date date,
  ADD COLUMN IF NOT EXISTS ticket_price varchar(100),
  ADD COLUMN IF NOT EXISTS schedule_info varchar(200);

-- 인덱스 (종료일 기준 정렬/필터에 사용)
CREATE INDEX IF NOT EXISTS idx_community_posts_performance_end_date
  ON public.community_posts (performance_end_date);
