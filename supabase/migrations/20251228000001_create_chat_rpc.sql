CREATE OR REPLACE FUNCTION public.create_new_chat_room(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_room_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  -- 1. Create room
  INSERT INTO public.private_chat_rooms DEFAULT VALUES
  RETURNING id INTO new_room_id;

  -- 2. Add participants
  INSERT INTO public.chat_participants (room_id, user_id)
  VALUES 
    (new_room_id, current_user_id),
    (new_room_id, other_user_id);

  RETURN new_room_id;
END;
$$;
