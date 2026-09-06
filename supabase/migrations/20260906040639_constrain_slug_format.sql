alter table works add constraint works_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table things add constraint things_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
