alter table works add column slug text unique not null;

alter table things add column slug text not null;
alter table things add constraint things_work_id_slug_key unique (work_id, slug);

alter table events add column thing_id uuid references things(id) on delete cascade;
create index events_thing_id_idx on events(thing_id);
