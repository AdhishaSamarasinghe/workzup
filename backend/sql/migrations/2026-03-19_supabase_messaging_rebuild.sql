-- WorkzUp messaging rebuild for Supabase/PostgreSQL.
-- This migration intentionally resets the messaging schema so the app can
-- move forward without depending on the previous partial implementations.

create extension if not exists "uuid-ossp";

drop function if exists public.get_user_conversations();
drop function if exists public.get_or_create_conversation(uuid, uuid);
drop function if exists public.fetch_messages(uuid);
drop function if exists public.send_message(uuid, text);
drop function if exists public.mark_messages_seen(uuid);
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user1_id uuid not null,
  user2_id uuid not null,
  created_at timestamptz not null default now(),
  constraint conversations_users_different check (user1_id <> user2_id)
);

create unique index conversations_unique_pair_idx
  on public.conversations (
    least(user1_id, user2_id),
    greatest(user1_id, user2_id)
  );

create index conversations_user1_idx on public.conversations (user1_id);
create index conversations_user2_idx on public.conversations (user2_id);
create index conversations_created_at_idx on public.conversations (created_at desc);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  content text not null,
  created_at timestamptz not null default now(),
  is_seen boolean not null default false,
  constraint messages_content_not_blank check (length(trim(content)) > 0)
);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at asc);

create index messages_unread_idx
  on public.messages (conversation_id, is_seen, sender_id);

grant usage on schema public to authenticated, service_role;
grant select, insert, update on public.conversations to authenticated, service_role;
grant select, insert, update on public.messages to authenticated, service_role;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "conversation participants can read conversations"
on public.conversations
for select
to authenticated
using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "conversation participants can insert conversations"
on public.conversations
for insert
to authenticated
with check (
  auth.uid() = user1_id
  or auth.uid() = user2_id
);

create policy "conversation participants can read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
  )
);

create policy "conversation participants can send messages"
on public.messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
  )
);

create policy "conversation participants can update messages"
on public.messages
for update
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
  )
)
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
  )
);

create or replace function public.get_or_create_conversation(user_a uuid, user_b uuid)
returns public.conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_user1 uuid;
  normalized_user2 uuid;
  target_conversation public.conversations;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if user_a is null or user_b is null then
    raise exception 'Both participants are required';
  end if;

  if user_a = user_b then
    raise exception 'Conversation participants must be different';
  end if;

  if auth.uid() <> user_a and auth.uid() <> user_b then
    raise exception 'You can only create conversations that include yourself';
  end if;

  normalized_user1 := least(user_a, user_b);
  normalized_user2 := greatest(user_a, user_b);

  select *
  into target_conversation
  from public.conversations
  where user1_id = normalized_user1
    and user2_id = normalized_user2
  limit 1;

  if found then
    return target_conversation;
  end if;

  insert into public.conversations (user1_id, user2_id)
  values (normalized_user1, normalized_user2)
  on conflict do nothing
  returning *
  into target_conversation;

  if target_conversation.id is null then
    select *
    into target_conversation
    from public.conversations
    where user1_id = normalized_user1
      and user2_id = normalized_user2
    limit 1;
  end if;

  return target_conversation;
end;
$$;

grant execute on function public.get_or_create_conversation(uuid, uuid) to authenticated;
grant execute on function public.get_or_create_conversation(uuid, uuid) to service_role;

create or replace function public.fetch_messages(target_conversation_id uuid)
returns setof public.messages
language sql
security definer
set search_path = public, auth
as $$
  select m.*
  from public.messages m
  join public.conversations c
    on c.id = m.conversation_id
  where m.conversation_id = target_conversation_id
    and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
  order by m.created_at asc;
$$;

grant execute on function public.fetch_messages(uuid) to authenticated;
grant execute on function public.fetch_messages(uuid) to service_role;

create or replace function public.send_message(target_conversation_id uuid, message_content text)
returns public.messages
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  inserted_message public.messages;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if message_content is null or length(trim(message_content)) = 0 then
    raise exception 'Message cannot be empty';
  end if;

  if not exists (
    select 1
    from public.conversations c
    where c.id = target_conversation_id
      and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
  ) then
    raise exception 'You are not allowed to send messages in this conversation';
  end if;

  insert into public.messages (conversation_id, sender_id, content)
  values (target_conversation_id, auth.uid(), trim(message_content))
  returning *
  into inserted_message;

  return inserted_message;
end;
$$;

grant execute on function public.send_message(uuid, text) to authenticated;
grant execute on function public.send_message(uuid, text) to service_role;

create or replace function public.mark_messages_seen(target_conversation_id uuid)
returns bigint
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  updated_count bigint;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.conversations c
    where c.id = target_conversation_id
      and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
  ) then
    raise exception 'You are not allowed to update this conversation';
  end if;

  update public.messages
  set is_seen = true
  where conversation_id = target_conversation_id
    and sender_id <> auth.uid()
    and is_seen = false;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

grant execute on function public.mark_messages_seen(uuid) to authenticated;
grant execute on function public.mark_messages_seen(uuid) to service_role;

create or replace function public.get_user_conversations()
returns table (
  id uuid,
  user1_id uuid,
  user2_id uuid,
  created_at timestamptz,
  other_user_id uuid,
  other_user_name text,
  other_user_email text,
  other_user_avatar text,
  last_message text,
  last_message_at timestamptz,
  unread_count bigint
)
language sql
security definer
set search_path = public, auth
as $$
  with my_conversations as (
    select c.*
    from public.conversations c
    where auth.uid() = c.user1_id or auth.uid() = c.user2_id
  ),
  latest_message as (
    select distinct on (m.conversation_id)
      m.conversation_id,
      m.content,
      m.created_at
    from public.messages m
    order by m.conversation_id, m.created_at desc
  ),
  unread_messages as (
    select
      m.conversation_id,
      count(*)::bigint as unread_count
    from public.messages m
    join my_conversations c on c.id = m.conversation_id
    where m.sender_id <> auth.uid()
      and m.is_seen = false
    group by m.conversation_id
  )
  select
    c.id,
    c.user1_id,
    c.user2_id,
    c.created_at,
    case
      when auth.uid() = c.user1_id then c.user2_id
      else c.user1_id
    end as other_user_id,
    coalesce(
      nullif(trim(
        concat_ws(
          ' ',
          other_user.raw_user_meta_data ->> 'first_name',
          other_user.raw_user_meta_data ->> 'last_name'
        )
      ), ''),
      nullif(other_user.raw_user_meta_data ->> 'full_name', ''),
      nullif(other_user.raw_user_meta_data ->> 'name', ''),
      nullif(other_user.raw_user_meta_data ->> 'company_name', ''),
      other_user.email,
      'Unknown user'
    ) as other_user_name,
    other_user.email as other_user_email,
    coalesce(
      nullif(other_user.raw_user_meta_data ->> 'avatar_url', ''),
      nullif(other_user.raw_user_meta_data ->> 'picture', '')
    ) as other_user_avatar,
    latest_message.content as last_message,
    latest_message.created_at as last_message_at,
    coalesce(unread_messages.unread_count, 0) as unread_count
  from my_conversations c
  left join auth.users other_user
    on other_user.id = case
      when auth.uid() = c.user1_id then c.user2_id
      else c.user1_id
    end
  left join latest_message
    on latest_message.conversation_id = c.id
  left join unread_messages
    on unread_messages.conversation_id = c.id
  order by coalesce(latest_message.created_at, c.created_at) desc;
$$;

grant execute on function public.get_user_conversations() to authenticated;
grant execute on function public.get_user_conversations() to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;
