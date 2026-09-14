alter table public.messages
  add column sequence bigint generated always as identity unique;

create index messages_work_sequence_idx on public.messages(work_id, sequence desc);

create or replace function public.touch_parent_work_updated_at() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  update public.works
  set updated_at = now()
  where id = coalesce(new.work_id, old.work_id);
  return coalesce(new, old);
end $$;

create trigger things_touch_parent_work
after insert or update or delete on public.things
for each row execute function public.touch_parent_work_updated_at();

create trigger relations_touch_parent_work
after insert or update or delete on public.relations
for each row execute function public.touch_parent_work_updated_at();

create trigger messages_touch_parent_work
after insert or delete on public.messages
for each row execute function public.touch_parent_work_updated_at();
