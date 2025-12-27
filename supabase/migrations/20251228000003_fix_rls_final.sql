-- 1. Create a secure function to check participation without recursion
-- SECURITY DEFINER means this runs with the privileges of the creator (usually postgres/admin),
-- bypassing RLS on the underlying table during execution.
CREATE OR REPLACE FUNCTION public.is_room_participant(check_room_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE room_id = check_room_id
    AND user_id = auth.uid()
  );
END;
$$;

-- 2. Drop recursion-prone policies
DROP POLICY IF EXISTS "Users can view participants in joined rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view messages in joined rooms" ON public.private_messages;
DROP POLICY IF EXISTS "Users can view joined rooms" ON public.private_chat_rooms;
-- Also drop the 'own participation' one if we want to unify, but keeping it is fine.
-- Let's just override the main visibility ones.

-- 3. Create new RLS policies using the secure function

-- Policy for private_chat_rooms
CREATE POLICY "Users can view rooms they are in"
ON public.private_chat_rooms FOR SELECT
USING ( public.is_room_participant(id) );

-- Policy for chat_participants
-- Users can see rows where they are the participant (already covered by "pure" RLS often, but let's Ensure)
-- OR if they are in the same room.
CREATE POLICY "Users can view participants in their rooms"
ON public.chat_participants FOR SELECT
USING ( public.is_room_participant(room_id) );

-- Policy for private_messages
CREATE POLICY "Users can view messages in their rooms"
ON public.private_messages FOR SELECT
USING ( public.is_room_participant(room_id) );

-- Re-ensure insert policies are sane (often unchanged from initial setup)
-- But ensuring insert for messages:
DROP POLICY IF EXISTS "Users can insert messages in their rooms" ON public.private_messages;
CREATE POLICY "Users can insert messages in their rooms"
ON public.private_messages FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    public.is_room_participant(room_id)
);
