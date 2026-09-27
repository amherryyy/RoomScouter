create type public.listing_status as enum (
  'draft',
  'pending',
  'approved',
  'rejected',
  'archived'
);

create type public.room_type as enum (
  'bedspace',
  'shared_room',
  'private_room',
  'studio'
);

create table public.boarding_houses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(trim(title)) between 3 and 120),
  description text not null check (char_length(trim(description)) between 20 and 5000),
  address_line text not null check (char_length(trim(address_line)) between 5 and 240),
  monthly_rent numeric(10, 2) not null check (monthly_rent >= 0),
  room_type public.room_type not null,
  available_rooms integer not null check (available_rooms between 0 and 1000),
  contact_name text not null check (char_length(trim(contact_name)) between 1 and 80),
  contact_phone text check (
    contact_phone is null or char_length(trim(contact_phone)) between 7 and 30
  ),
  contact_email text check (
    contact_email is null or char_length(trim(contact_email)) between 3 and 254
  ),
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  status public.listing_status not null default 'draft',
  submitted_at timestamptz,
  moderated_at timestamptz,
  moderated_by uuid references public.profiles (id) on delete set null,
  moderation_note text check (
    moderation_note is null or char_length(trim(moderation_note)) between 1 and 1000
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (contact_phone is not null or contact_email is not null)
);

create table public.moderation_events (
  id bigint generated always as identity primary key,
  boarding_house_id uuid not null references public.boarding_houses (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  action public.listing_status not null check (action in ('approved', 'rejected', 'archived')),
  reason text check (reason is null or char_length(trim(reason)) between 1 and 1000),
  created_at timestamptz not null default now(),
  check (action = 'approved' or reason is not null)
);

create index boarding_houses_owner_id_idx on public.boarding_houses (owner_id);
create index boarding_houses_status_created_at_idx
on public.boarding_houses (status, created_at desc);
create index boarding_houses_public_price_idx
on public.boarding_houses (monthly_rent, id)
where status = 'approved' and available_rooms > 0;
create index boarding_houses_public_room_type_idx
on public.boarding_houses (room_type, id)
where status = 'approved' and available_rooms > 0;
create index moderation_events_boarding_house_created_at_idx
on public.moderation_events (boarding_house_id, created_at desc);

create function public.current_user_is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'owner'
  );
$$;

revoke all on function public.current_user_is_owner() from public;
grant execute on function public.current_user_is_owner() to authenticated;

create function public.prepare_boarding_house_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();

  if (select auth.uid()) = old.owner_id
    and not public.current_user_is_admin()
    and old.status = 'approved'
    and (
      new.title,
      new.description,
      new.address_line,
      new.monthly_rent,
      new.room_type,
      new.contact_name,
      new.contact_phone,
      new.contact_email,
      new.latitude,
      new.longitude
    ) is distinct from (
      old.title,
      old.description,
      old.address_line,
      old.monthly_rent,
      old.room_type,
      old.contact_name,
      old.contact_phone,
      old.contact_email,
      old.latitude,
      old.longitude
    )
  then
    new.status := 'pending';
    new.submitted_at := now();
    new.moderated_at := null;
    new.moderated_by := null;
    new.moderation_note := null;
  end if;

  return new;
end;
$$;

revoke all on function public.prepare_boarding_house_update() from public;

create trigger boarding_houses_prepare_update
before update on public.boarding_houses
for each row execute function public.prepare_boarding_house_update();

create function public.submit_boarding_house(target_id uuid)
returns public.boarding_houses
language plpgsql
security definer
set search_path = ''
as $$
declare
  listing public.boarding_houses;
begin
  select * into listing
  from public.boarding_houses
  where id = target_id
  for update;

  if listing.id is null or listing.owner_id <> (select auth.uid()) then
    raise exception 'Boarding house was not found.' using errcode = 'P0002';
  end if;

  if not public.current_user_is_owner() then
    raise exception 'Only owners can submit boarding houses.' using errcode = '42501';
  end if;

  if listing.status not in ('draft', 'rejected') then
    raise exception 'Only draft or rejected boarding houses can be submitted.' using errcode = '22023';
  end if;

  update public.boarding_houses
  set status = 'pending',
      submitted_at = now(),
      moderated_at = null,
      moderated_by = null,
      moderation_note = null
  where id = target_id
  returning * into listing;

  return listing;
end;
$$;

revoke all on function public.submit_boarding_house(uuid) from public, anon;
grant execute on function public.submit_boarding_house(uuid) to authenticated;

create function public.moderate_boarding_house(
  target_id uuid,
  decision public.listing_status,
  reason text default null
)
returns public.boarding_houses
language plpgsql
security definer
set search_path = ''
as $$
declare
  listing public.boarding_houses;
  normalized_reason text := nullif(trim(reason), '');
begin
  if not public.current_user_is_admin() then
    raise exception 'Only administrators can moderate boarding houses.' using errcode = '42501';
  end if;

  select * into listing
  from public.boarding_houses
  where id = target_id
  for update;

  if listing.id is null then
    raise exception 'Boarding house was not found.' using errcode = 'P0002';
  end if;

  if not (
    (listing.status = 'pending' and decision in ('approved', 'rejected'))
    or (listing.status = 'approved' and decision = 'archived')
  ) then
    raise exception 'The requested moderation transition is not allowed.' using errcode = '22023';
  end if;

  if decision in ('rejected', 'archived') and normalized_reason is null then
    raise exception 'A moderation reason is required.' using errcode = '22023';
  end if;

  update public.boarding_houses
  set status = decision,
      moderated_at = now(),
      moderated_by = (select auth.uid()),
      moderation_note = normalized_reason
  where id = target_id
  returning * into listing;

  insert into public.moderation_events (boarding_house_id, actor_id, action, reason)
  values (target_id, (select auth.uid()), decision, normalized_reason);

  return listing;
end;
$$;

revoke all on function public.moderate_boarding_house(uuid, public.listing_status, text)
from public, anon;
grant execute on function public.moderate_boarding_house(uuid, public.listing_status, text)
to authenticated;

alter table public.boarding_houses enable row level security;
alter table public.boarding_houses force row level security;
alter table public.moderation_events enable row level security;
alter table public.moderation_events force row level security;

revoke all on table public.boarding_houses from public, anon, authenticated;
grant select on table public.boarding_houses to anon, authenticated;
grant insert (
  owner_id,
  title,
  description,
  address_line,
  monthly_rent,
  room_type,
  available_rooms,
  contact_name,
  contact_phone,
  contact_email,
  latitude,
  longitude
) on table public.boarding_houses to authenticated;
grant update (
  title,
  description,
  address_line,
  monthly_rent,
  room_type,
  available_rooms,
  contact_name,
  contact_phone,
  contact_email,
  latitude,
  longitude
) on table public.boarding_houses to authenticated;

revoke all on table public.moderation_events from public, anon, authenticated;
grant select on table public.moderation_events to authenticated;

create policy "boarding_houses_select_public"
on public.boarding_houses
for select
to anon, authenticated
using (status = 'approved' and available_rooms > 0);

create policy "boarding_houses_select_owner"
on public.boarding_houses
for select
to authenticated
using (owner_id = (select auth.uid()));

create policy "boarding_houses_select_admin"
on public.boarding_houses
for select
to authenticated
using (public.current_user_is_admin());

create policy "boarding_houses_insert_owner"
on public.boarding_houses
for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and public.current_user_is_owner()
);

create policy "boarding_houses_update_owner"
on public.boarding_houses
for update
to authenticated
using (
  owner_id = (select auth.uid())
  and public.current_user_is_owner()
)
with check (
  owner_id = (select auth.uid())
  and public.current_user_is_owner()
);

create policy "boarding_houses_update_admin"
on public.boarding_houses
for update
to authenticated
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

create policy "moderation_events_select_owner"
on public.moderation_events
for select
to authenticated
using (
  exists (
    select 1
    from public.boarding_houses
    where boarding_houses.id = moderation_events.boarding_house_id
      and boarding_houses.owner_id = (select auth.uid())
  )
);

create policy "moderation_events_select_admin"
on public.moderation_events
for select
to authenticated
using (public.current_user_is_admin());
