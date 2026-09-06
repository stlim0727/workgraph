insert into works (slug, title, summary, status)
values ('graph-app', 'Graph 앱 만들기', '대화가 상태를 안전하게 바꾸는, 가장 작고 지속 가능한 작업 공간을 만들고 있어요.', 'active');

insert into things (work_id, slug, name, type, description, data)
select w.id, t.slug, t.name, t.type, t.description, t.data
from works w, (values
  ('product-vision','product-vision','vision','Workgraph가 해결하려는 문제와 제품의 중심 원칙', '{"color":"coral"}'::jsonb),
  ('graph','graph','concept','Things 사이의 관계로 만들어지는 작업의 맥락', '{"color":"violet"}'::jsonb),
  ('lambda','lambda','concept','작은 행동 단위에 대한 초기 아이디어', '{"color":"blue"}'::jsonb),
  ('things','things','system','계속 참조할 가치가 있는 개념과 결과물', '{"color":"mint"}'::jsonb),
  ('process','process','concept','작업이 앞으로 나아가는 방식', '{"color":"amber"}'::jsonb),
  ('mode','mode','idea','상황에 따른 작업 인터페이스 아이디어 — 현재 보류', '{"color":"pink"}'::jsonb),
  ('plugin','plugin','idea','기능 확장을 위한 장기 아이디어 — V0 범위 밖', '{"color":"blue"}'::jsonb),
  ('prototype','prototype','deliverable','검증을 위한 첫 번째 동작 가능한 제품', '{"color":"coral"}'::jsonb),
  ('notion','notion','reference','기존 작업 도구와 비교하기 위한 레퍼런스', '{"color":"violet"}'::jsonb)
) as t(slug, name, type, description, data)
where w.slug = 'graph-app';

insert into messages (work_id, role, content, created_at)
select w.id, m.role, m.content, now() - m.age
from works w, (values
  ('user','지금 우리가 가장 먼저 검증해야 하는 게 뭐야?', interval '24 minutes'),
  ('assistant','핵심은 며칠 뒤에도 이 공간으로 돌아와 ''어디까지 왔지?''라고 자연스럽게 묻게 되는지예요. 지금은 @prototype으로 그 흐름을 최대한 작게 확인하는 단계예요.', interval '23 minutes')
) as m(role, content, age)
where w.slug = 'graph-app';

insert into events (work_id, actor_type, type, payload, thing_id, created_at)
select t.work_id, 'system', 'thing_created', jsonb_build_object('thingSlug', t.slug), t.id, now() - interval '18 hours'
from things t
join works w on w.id = t.work_id
where w.slug = 'graph-app';

insert into events (work_id, actor_type, type, payload, thing_id, created_at)
select t.work_id, 'agent', 'thing_referenced', jsonb_build_object('thingSlug', t.slug), t.id, now() - interval '37 minutes'
from things t
join works w on w.id = t.work_id
where w.slug = 'graph-app' and t.slug in ('product-vision', 'prototype');
