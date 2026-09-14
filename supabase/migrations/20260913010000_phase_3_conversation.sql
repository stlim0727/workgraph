create or replace function public.append_mock_conversation(target_work_id uuid, user_content text) returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  normalized_content text := trim(user_content);
  user_message_id uuid;
  assistant_message_id uuid;
begin
  if not exists(select 1 from public.works where id = target_work_id) then
    raise exception 'Work not found';
  end if;
  if normalized_content is null or char_length(normalized_content) not between 1 and 10000 then
    raise exception 'Message content must contain between 1 and 10000 characters';
  end if;

  insert into public.messages(work_id, role, content)
  values (target_work_id, 'user', normalized_content)
  returning id into user_message_id;

  insert into public.messages(work_id, role, content)
  values (
    target_work_id,
    'assistant',
    '메시지를 기억해 두었어요. 지금은 Phase 3의 저장 확인용 응답이며, 다음 단계에서 현재 Work의 맥락을 바탕으로 답할 수 있어요.'
  )
  returning id into assistant_message_id;

  insert into public.events(work_id, actor_type, type, payload)
  values (
    target_work_id,
    'user',
    'conversation.appended',
    jsonb_build_object('message_id', user_message_id, 'assistant_message_id', assistant_message_id)
  );
end $$;

revoke execute on function public.append_mock_conversation(uuid, text) from public, anon, authenticated;
grant execute on function public.append_mock_conversation(uuid, text) to service_role;
