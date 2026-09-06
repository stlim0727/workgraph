alter table events drop constraint events_thing_id_fkey;
alter table events add constraint events_thing_id_fkey
  foreign key (thing_id) references things(id) on delete set null;
