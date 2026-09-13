create extension if not exists pgcrypto;

create type public.work_status as enum ('active', 'paused', 'done');
create type public.message_role as enum ('user', 'assistant', 'system');
create type public.event_actor_type as enum ('user', 'agent', 'system');

create table public.works (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 120),
  summary text check (summary is null or char_length(summary) <= 500),
  status public.work_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.things (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  type text not null check (char_length(type) between 1 and 40),
  description text check (description is null or char_length(description) <= 500),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (work_id, slug),
  unique (work_id, id)
);

create table public.relations (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  from_thing_id uuid not null,
  type text not null check (char_length(type) between 1 and 40),
  to_thing_id uuid not null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  foreign key (work_id, from_thing_id) references public.things(work_id, id) on delete cascade,
  foreign key (work_id, to_thing_id) references public.things(work_id, id) on delete cascade,
  check (from_thing_id <> to_thing_id),
  unique (work_id, from_thing_id, type, to_thing_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  role public.message_role not null,
  content text not null check (char_length(content) between 1 and 10000),
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  actor_type public.event_actor_type not null,
  actor_id uuid,
  type text not null check (char_length(type) between 1 and 80),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now()
);

create index things_work_id_idx on public.things(work_id);
create index relations_work_id_idx on public.relations(work_id);
create index messages_work_created_idx on public.messages(work_id, created_at);
create index events_work_created_idx on public.events(work_id, created_at desc);
create index events_payload_idx on public.events using gin(payload);

create or replace function public.slugify(value text) returns text
language sql immutable strict
set search_path = ''
as $$ select trim(both '-' from regexp_replace(lower(value), '[^a-z0-9]+', '-', 'g')) $$;

create or replace function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$ begin new.updated_at = now(); return new; end $$;

create trigger works_touch_updated_at before update on public.works for each row execute function public.touch_updated_at();
create trigger things_touch_updated_at before update on public.things for each row execute function public.touch_updated_at();

create or replace function public.create_work_with_event(work_title text, work_summary text default null) returns text
language plpgsql security definer
set search_path = ''
as $$
declare new_work public.works; base_slug text;
begin
  if char_length(trim(work_title)) not between 1 and 120 then raise exception 'Invalid work title'; end if;
  base_slug := public.slugify(work_title);
  if base_slug = '' then base_slug := 'work'; end if;
  insert into public.works(slug, title, summary)
  values (base_slug || '-' || substr(gen_random_uuid()::text, 1, 8), trim(work_title), nullif(trim(work_summary), '')) returning * into new_work;
  insert into public.events(work_id, actor_type, type, payload) values (new_work.id, 'user', 'work.created', jsonb_build_object('work_id', new_work.id));
  return new_work.slug;
end $$;

create or replace function public.create_thing_with_event(target_work_id uuid, thing_name text, thing_type text, thing_description text default null, thing_data jsonb default '{}') returns text
language plpgsql security definer
set search_path = ''
as $$
declare new_thing public.things; base_slug text;
begin
  if not exists(select 1 from public.works where id = target_work_id) then raise exception 'Work not found'; end if;
  base_slug := public.slugify(thing_name);
  if base_slug = '' then base_slug := 'thing'; end if;
  insert into public.things(work_id, slug, name, type, description, data)
  values (target_work_id, base_slug || '-' || substr(gen_random_uuid()::text, 1, 8), trim(thing_name), trim(thing_type), nullif(trim(thing_description), ''), thing_data) returning * into new_thing;
  insert into public.events(work_id, actor_type, type, payload) values (target_work_id, 'user', 'thing.created', jsonb_build_object('thing_id', new_thing.id));
  return new_thing.slug;
end $$;

create or replace function public.update_thing_with_event(target_work_id uuid, target_thing_id uuid, thing_patch jsonb) returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not (thing_patch <@ jsonb_build_object('type', thing_patch->'type', 'description', thing_patch->'description')) then raise exception 'Unsupported patch field'; end if;
  update public.things set type = coalesce(nullif(trim(thing_patch->>'type'), ''), type), description = case when thing_patch ? 'description' then nullif(trim(thing_patch->>'description'), '') else description end
  where id = target_thing_id and work_id = target_work_id;
  if not found then raise exception 'Thing not found in Work'; end if;
  insert into public.events(work_id, actor_type, type, payload) values (target_work_id, 'user', 'thing.updated', jsonb_build_object('thing_id', target_thing_id, 'patch', thing_patch));
end $$;

create or replace function public.relate_things_with_event(target_work_id uuid, source_thing_id uuid, relation_type text, destination_thing_id uuid, relation_metadata jsonb default '{}') returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare new_relation_id uuid;
begin
  insert into public.relations(work_id, from_thing_id, type, to_thing_id, metadata)
  values (target_work_id, source_thing_id, trim(relation_type), destination_thing_id, relation_metadata) returning id into new_relation_id;
  insert into public.events(work_id, actor_type, type, payload) values (target_work_id, 'user', 'relation.created', jsonb_build_object('relation_id', new_relation_id, 'thing_id', source_thing_id, 'to_thing_id', destination_thing_id));
  return new_relation_id;
end $$;

alter table public.works enable row level security;
alter table public.things enable row level security;
alter table public.relations enable row level security;
alter table public.messages enable row level security;
alter table public.events enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke execute on function public.create_work_with_event(text, text) from public, anon, authenticated;
revoke execute on function public.create_thing_with_event(uuid, text, text, text, jsonb) from public, anon, authenticated;
revoke execute on function public.update_thing_with_event(uuid, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.relate_things_with_event(uuid, uuid, text, uuid, jsonb) from public, anon, authenticated;
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant execute on function public.create_work_with_event(text, text) to service_role;
grant execute on function public.create_thing_with_event(uuid, text, text, text, jsonb) to service_role;
grant execute on function public.update_thing_with_event(uuid, uuid, jsonb) to service_role;
grant execute on function public.relate_things_with_event(uuid, uuid, text, uuid, jsonb) to service_role;

insert into public.works(id, slug, title, summary) values ('00000000-0000-4000-8000-000000000001', 'graph-app', 'Graph 앱 만들기', '대화가 상태를 안전하게 바꾸는, 가장 작고 지속 가능한 작업 공간을 만들고 있어요.');

insert into public.things(work_id, slug, name, type, description) values
('00000000-0000-4000-8000-000000000001', 'product-vision', 'product-vision', 'vision', 'Workgraph가 해결하려는 문제와 제품의 중심 원칙'),
('00000000-0000-4000-8000-000000000001', 'graph', 'graph', 'concept', 'Things 사이의 관계로 만들어지는 작업의 맥락'),
('00000000-0000-4000-8000-000000000001', 'lambda', 'lambda', 'concept', '작은 행동 단위에 대한 초기 아이디어'),
('00000000-0000-4000-8000-000000000001', 'things', 'things', 'system', '계속 참조할 가치가 있는 개념과 결과물'),
('00000000-0000-4000-8000-000000000001', 'process', 'process', 'concept', '작업이 앞으로 나아가는 방식'),
('00000000-0000-4000-8000-000000000001', 'mode', 'mode', 'idea', '상황에 따른 작업 인터페이스 아이디어 — 현재 보류'),
('00000000-0000-4000-8000-000000000001', 'plugin', 'plugin', 'idea', '기능 확장을 위한 장기 아이디어 — V0 범위 밖'),
('00000000-0000-4000-8000-000000000001', 'prototype', 'prototype', 'deliverable', '검증을 위한 첫 번째 동작 가능한 제품'),
('00000000-0000-4000-8000-000000000001', 'notion', 'notion', 'reference', '기존 작업 도구와 비교하기 위한 레퍼런스');

insert into public.messages(work_id, role, content) values
('00000000-0000-4000-8000-000000000001', 'user', '지금 우리가 가장 먼저 검증해야 하는 게 뭐야?'),
('00000000-0000-4000-8000-000000000001', 'assistant', '핵심은 며칠 뒤에도 이 공간으로 돌아와 ‘어디까지 왔지?’라고 자연스럽게 묻게 되는지예요. 지금은 @prototype으로 그 흐름을 최대한 작게 확인하는 단계예요.');
