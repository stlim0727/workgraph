create or replace function touch_work_updated_at() returns trigger as $$
begin
  if tg_op = 'UPDATE' and new.work_id is distinct from old.work_id then
    update works set updated_at = now() where id in (new.work_id, old.work_id);
  else
    update works set updated_at = now() where id = coalesce(new.work_id, old.work_id);
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;
