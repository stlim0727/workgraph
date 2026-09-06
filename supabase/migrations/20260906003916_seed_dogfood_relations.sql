insert into relations (work_id, from_thing_id, type, to_thing_id)
select w.id, ft.id, r.type, tt.id
from works w
join things ft on ft.work_id = w.id
join things tt on tt.work_id = w.id
join (values
  ('product-vision', 'relates_to', 'graph'),
  ('product-vision', 'relates_to', 'prototype'),
  ('graph', 'relates_to', 'lambda'),
  ('graph', 'relates_to', 'things'),
  ('process', 'relates_to', 'mode'),
  ('process', 'relates_to', 'plugin'),
  ('prototype', 'relates_to', 'notion')
) as r(from_slug, type, to_slug) on r.from_slug = ft.slug and r.to_slug = tt.slug
where w.slug = 'graph-app';
