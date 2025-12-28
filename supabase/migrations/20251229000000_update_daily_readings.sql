-- Add reading_type and cards columns
ALTER TABLE public.daily_readings
ADD COLUMN IF NOT EXISTS reading_type TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS cards JSONB;

-- Make single card fields nullable as they might not be used for multi-card spreads
ALTER TABLE public.daily_readings
ALTER COLUMN card_name DROP NOT NULL;

-- card_image is already nullable in the original schema but good to be explicit/safe or ignore if verified.
-- It was created as: card_image TEXT (which implies nullable by default)
-- But card_name TEXT NOT NULL. So we dropped not null for card_name.

-- Also ensure 'question' column allows nulls? No, question should be required usually.
-- But wait, my code maps query -> question.
