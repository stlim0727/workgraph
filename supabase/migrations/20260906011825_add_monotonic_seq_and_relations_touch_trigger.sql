alter table messages add column seq bigserial;
alter table events add column seq bigserial;

create trigger relations_touch_work
  after insert or update or delete on relations
  for each row execute function touch_work_updated_at();
