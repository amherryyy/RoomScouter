create function public.provision_admin(target_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(trim(target_email));
  target_user_id uuid;
begin
  if normalized_email = '' then
    raise exception 'Administrator email is required.' using errcode = '22023';
  end if;

  select id
  into target_user_id
  from auth.users
  where lower(email) = normalized_email;

  if target_user_id is null then
    raise exception 'No authentication user exists for the supplied email.' using errcode = 'P0002';
  end if;

  update public.profiles
  set role = 'admin'
  where id = target_user_id
    and role <> 'admin';

  if not found then
    perform 1 from public.profiles where id = target_user_id;
    if not found then
      raise exception 'The authentication user does not have a profile.' using errcode = 'P0002';
    end if;
  end if;

  return target_user_id;
end;
$$;

revoke all on function public.provision_admin(text) from public, anon, authenticated;
grant execute on function public.provision_admin(text) to postgres;
