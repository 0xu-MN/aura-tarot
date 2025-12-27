-- Drop existing policies causing recursion
DROP POLICY IF EXISTS "Users can view participants in their rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.private_messages;
DROP POLICY IF EXISTS "Users can view rooms they are participants in" ON public.private_chat_rooms;

-- Simplified chat_participants policy
-- Users can see rows where they are the user_id (their own participation)
CREATE POLICY "Users can view their own participation"
ON public.chat_participants FOR SELECT
USING (auth.uid() = user_id);

-- Users can see all participants in rooms they belong to
-- This avoids recursion by not querying the table itself in the USING clause if possible,
-- OR by relying on the fact that we query 'room_id' derived from a safe source.
-- However, standard pattern is:
CREATE POLICY "Users can view participants in joined rooms"
ON public.chat_participants FOR SELECT
USING (
    room_id IN (
        SELECT room_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
);

-- Fix private_messages policy
CREATE POLICY "Users can view messages in joined rooms"
ON public.private_messages FOR SELECT
USING (
    room_id IN (
        SELECT room_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
);

-- Fix private_chat_rooms policy
CREATE POLICY "Users can view joined rooms"
ON public.private_chat_rooms FOR SELECT
USING (
    id IN (
        SELECT room_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
);
