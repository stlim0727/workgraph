update works w
set updated_at = greatest(
  w.created_at,
  coalesce((select max(created_at) from things where work_id = w.id), w.created_at),
  coalesce((select max(created_at) from messages where work_id = w.id), w.created_at),
  coalesce((select max(created_at) from events where work_id = w.id), w.created_at)
)
where w.slug = 'graph-app';
