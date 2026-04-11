-- 20260412000000_create_lounge_tables.sql

CREATE TABLE IF NOT EXISTS public.lounge_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    card_name TEXT,
    card_image_url TEXT,
    lat FLOAT8,
    lng FLOAT8,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0
);

-- Enable RLS (allow public insert and select for MVP simplicity, we filter in UI)
ALTER TABLE public.lounge_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.lounge_threads FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.lounge_threads FOR INSERT WITH CHECK (true);
