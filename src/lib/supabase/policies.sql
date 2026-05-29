create or replace function public.is_room_member(
  p_room_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_members rm
    join public.rooms r
      on r.id = rm.room_id
    where rm.room_id = p_room_id
      and rm.user_id = p_user_id
      and r.is_archived = false
  );
$$;

create or replace function public.shares_room_with_profile(
  p_profile_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_members viewer
    join public.room_members target
      on target.room_id = viewer.room_id
    join public.rooms r
      on r.id = viewer.room_id
    where viewer.user_id = p_user_id
      and target.user_id = p_profile_id
      and r.is_archived = false
  );
$$;

create or replace function public.is_realtime_room_member(
  p_topic text,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_topic like 'room:%'
    and exists (
      select 1
      from public.room_members rm
      join public.rooms r
        on r.id = rm.room_id
      where rm.user_id = p_user_id
        and rm.room_id::text = split_part(p_topic, ':', 2)
        and r.is_archived = false
    );
$$;

create or replace function public.can_manage_room_members(
  p_room_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_members rm
    join public.rooms r
      on r.id = rm.room_id
    where rm.room_id = p_room_id
      and rm.user_id = p_user_id
      and rm.role in ('owner', 'admin')
      and r.is_archived = false
  );
$$;

grant execute on function public.is_room_member(uuid, uuid) to authenticated;
grant execute on function public.shares_room_with_profile(uuid, uuid) to authenticated;
grant execute on function public.is_realtime_room_member(text, uuid) to authenticated;
grant execute on function public.can_manage_room_members(uuid, uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.messages enable row level security;
alter table public.message_reactions enable row level security;

drop policy if exists "profiles_select_own_or_shared_room" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own_or_shared_room"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.shares_room_with_profile(id, auth.uid())
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
);

drop policy if exists "rooms_select_visible_to_authenticated_users" on public.rooms;
drop policy if exists "rooms_insert_own" on public.rooms;
drop policy if exists "rooms_update_owner" on public.rooms;
drop policy if exists "rooms_delete_owner" on public.rooms;

create policy "rooms_select_visible_to_authenticated_users"
on public.rooms
for select
to authenticated
using (
  is_archived = false
  and (
    visibility = 'public'
    or public.is_room_member(id, auth.uid())
  )
);

create policy "rooms_insert_own"
on public.rooms
for insert
to authenticated
with check (
  owner_id = auth.uid()
);

create policy "rooms_update_owner"
on public.rooms
for update
to authenticated
using (
  owner_id = auth.uid()
  and is_archived = false
)
with check (
  owner_id = auth.uid()
);

create policy "rooms_delete_owner"
on public.rooms
for delete
to authenticated
using (
  owner_id = auth.uid()
);

drop policy if exists "room_members_select_room_members" on public.room_members;
drop policy if exists "room_members_insert_self_public_or_owned_room" on public.room_members;
drop policy if exists "room_members_update_room_owner" on public.room_members;
drop policy if exists "room_members_delete_self_or_room_owner" on public.room_members;

create policy "room_members_select_room_members"
on public.room_members
for select
to authenticated
using (
  public.is_room_member(room_id, auth.uid())
);

create policy "room_members_insert_self_public_or_owned_room"
on public.room_members
for insert
to authenticated
with check (
  (
    user_id = auth.uid()
    and role = 'member'
    and exists (
      select 1
      from public.rooms r
      where r.id = room_id
        and r.is_archived = false
        and r.visibility = 'public'
    )
  )
  or (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1
      from public.rooms r
      where r.id = room_id
        and r.is_archived = false
        and r.owner_id = auth.uid()
    )
  )
  or (
    role = 'member'
    and public.can_manage_room_members(room_id, auth.uid())
  )
);

create policy "room_members_delete_self_or_room_owner"
on public.room_members
for delete
to authenticated
using (
  role <> 'owner'
  and (
    (
      user_id = auth.uid()
      and public.is_room_member(room_id, auth.uid())
    )
    or public.can_manage_room_members(room_id, auth.uid())
  )
);

drop policy if exists "messages_select_room_members" on public.messages;
drop policy if exists "messages_insert_own_as_room_member" on public.messages;
drop policy if exists "messages_update_own" on public.messages;
drop policy if exists "messages_delete_own_or_room_owner" on public.messages;

create policy "messages_select_room_members"
on public.messages
for select
to authenticated
using (
  public.is_room_member(room_id, auth.uid())
);

create policy "messages_insert_own_as_room_member"
on public.messages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_room_member(room_id, auth.uid())
);

create policy "messages_update_own"
on public.messages
for update
to authenticated
using (
  user_id = auth.uid()
  and public.is_room_member(room_id, auth.uid())
)
with check (
  user_id = auth.uid()
  and public.is_room_member(room_id, auth.uid())
);

create policy "messages_delete_own_or_room_owner"
on public.messages
for delete
to authenticated
using (
  user_id = auth.uid()
  and public.is_room_member(room_id, auth.uid())
);

drop policy if exists "message_reactions_select_room_members" on public.message_reactions;
drop policy if exists "message_reactions_insert_own_as_room_member" on public.message_reactions;
drop policy if exists "message_reactions_delete_own" on public.message_reactions;

create policy "message_reactions_select_room_members"
on public.message_reactions
for select
to authenticated
using (
  exists (
    select 1
    from public.messages m
    where m.id = message_id
      and public.is_room_member(m.room_id, auth.uid())
  )
);

alter table realtime.messages enable row level security;

drop policy if exists "realtime_messages_select_room_broadcasts" on realtime.messages;
drop policy if exists "realtime_messages_insert_room_broadcasts" on realtime.messages;

create policy "realtime_messages_select_room_broadcasts"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and public.is_realtime_room_member(
    (select realtime.topic()),
    auth.uid()
  )
);

create policy "realtime_messages_insert_room_broadcasts"
on realtime.messages
for insert
to authenticated
with check (
  realtime.messages.extension = 'broadcast'
  and public.is_realtime_room_member(
    (select realtime.topic()),
    auth.uid()
  )
);

create policy "message_reactions_insert_own_as_room_member"
on public.message_reactions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.messages m
    where m.id = message_id
      and public.is_room_member(m.room_id, auth.uid())
  )
);

create policy "message_reactions_delete_own"
on public.message_reactions
for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.messages m
    where m.id = message_id
      and public.is_room_member(m.room_id, auth.uid())
  )
);
