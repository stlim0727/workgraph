create or replace function touch_work_updated_at() returns trigger as $$
begin
  update works set updated_at = now() where id = coalesce(new.work_id, old.work_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger things_touch_work
  after insert or update or delete on things
  for each row execute function touch_work_updated_at();

create trigger messages_touch_work
  after insert or update or delete on messages
  for each row execute function touch_work_updated_at();

create trigger events_touch_work
  after insert or update or delete on events
  for each row execute function touch_work_updated_at();
