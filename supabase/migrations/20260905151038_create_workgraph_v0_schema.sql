create extension if not exists pgcrypto;

create table works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  status text not null default 'active' check (status in ('active', 'paused', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table things (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works(id) on delete cascade,
  name text not null,
  type text not null,
  description text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index things_work_id_idx on things(work_id);

create table relations (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works(id) on delete cascade,
  from_thing_id uuid not null references things(id) on delete cascade,
  type text not null,
  to_thing_id uuid not null references things(id) on delete cascade,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index relations_work_id_idx on relations(work_id);
create index relations_from_thing_id_idx on relations(from_thing_id);
create index relations_to_thing_id_idx on relations(to_thing_id);

create table messages (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);
create index messages_work_id_idx on messages(work_id);

create table events (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works(id) on delete cascade,
  actor_type text not null check (actor_type in ('user', 'agent', 'system')),
  actor_id text,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index events_work_id_idx on events(work_id);

-- V0 is single-user with no client-side Supabase access: all reads/writes go
-- through the Next.js server layer using the service role key, which bypasses
-- RLS. RLS is enabled with no policies so anon/authenticated keys get zero
-- access if ever used by mistake.
alter table works enable row level security;
alter table things enable row level security;
alter table relations enable row level security;
alter table messages enable row level security;
alter table events enable row level security;
