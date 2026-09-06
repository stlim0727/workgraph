update works
set created_at = created_at - interval '2 days'
where slug = 'graph-app';

update things
set created_at = created_at - interval '2 days',
    updated_at = updated_at - interval '2 days'
where work_id = (select id from works where slug = 'graph-app');
