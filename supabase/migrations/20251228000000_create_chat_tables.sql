-- Create private_chat_rooms table
CREATE TABLE IF NOT EXISTS public.private_chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create chat_participants table
CREATE TABLE IF NOT EXISTS public.chat_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.private_chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
);

-- Create private_messages table
CREATE TABLE IF NOT EXISTS public.private_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.private_chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.private_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;

-- private_chat_rooms policies
CREATE POLICY "Users can view rooms they are participants in"
    ON public.private_chat_rooms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants
            WHERE chat_participants.room_id = private_chat_rooms.id
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create rooms"
    ON public.private_chat_rooms FOR INSERT
    WITH CHECK (true); -- Ideally restricted via participants logic, but simple for now

-- chat_participants policies
CREATE POLICY "Users can view participants in their rooms"
    ON public.chat_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants cp
            WHERE cp.room_id = chat_participants.room_id
            AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can add themselves or others to rooms"
    ON public.chat_participants FOR INSERT
    WITH CHECK (
        -- Allow if user is adding themselves OR if they are creating a new room (which connects to the room creation flow)
        -- For simplicity in this app: any authenticated user can add participants
        auth.role() = 'authenticated'
    );

-- private_messages policies
CREATE POLICY "Users can view messages in their rooms"
    ON public.private_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_participants
            WHERE chat_participants.room_id = private_messages.room_id
            AND chat_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in their rooms"
    ON public.private_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chat_participants
            WHERE chat_participants.room_id = private_messages.room_id
            AND chat_participants.user_id = auth.uid()
        )
    );
