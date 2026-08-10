-- Promote the bootstrap admin
update public.profiles
set role = 'admin', updated_at = now()
where email = 'admin@khama.com'
  and role <> 'admin';

insert into public.admin_users (user_id, role)
select id, 'admin' from public.profiles where email = 'admin@khama.com'
on conflict (user_id) do nothing;
