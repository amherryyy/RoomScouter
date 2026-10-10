alter table public.boarding_houses
  add column barangay text
  check (barangay is null or (barangay = trim(barangay) and char_length(barangay) between 2 and 80));

grant insert (barangay) on table public.boarding_houses to authenticated;
grant update (barangay) on table public.boarding_houses to authenticated;

create or replace function public.prepare_boarding_house_update()
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
      new.barangay,
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
      old.barangay,
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

drop index if exists public.boarding_houses_public_search_idx;
create index boarding_houses_public_search_idx
on public.boarding_houses
using gin (
  to_tsvector(
    'simple',
    title || ' ' || coalesce(barangay, '') || ' ' || address_line || ' ' || description
  )
)
where status = 'approved' and available_rooms > 0;
create index boarding_houses_public_barangay_idx
on public.boarding_houses (lower(trim(barangay)), id)
where status = 'approved' and available_rooms > 0 and barangay is not null;

drop function if exists public.search_public_boarding_houses(
  text, numeric, integer, public.room_type, smallint, smallint,
  numeric, numeric, numeric, integer, integer
);

create function public.search_public_boarding_houses(
  search_text text default null,
  maximum_monthly_rent numeric default null,
  minimum_available_rooms integer default 1,
  selected_room_type public.room_type default null,
  selected_facility_id smallint default null,
  selected_utility_id smallint default null,
  university_latitude numeric default null,
  university_longitude numeric default null,
  maximum_distance_km numeric default null,
  page_size integer default 12,
  page_offset integer default 0,
  selected_barangay text default null
)
returns table (
  id uuid,
  title text,
  description text,
  address_line text,
  barangay text,
  monthly_rent numeric,
  room_type public.room_type,
  available_rooms integer,
  latitude numeric,
  longitude numeric,
  approximate_distance_km numeric,
  total_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with filtered as (
    select
      boarding_house.id,
      boarding_house.title,
      boarding_house.description,
      boarding_house.address_line,
      boarding_house.barangay,
      boarding_house.monthly_rent,
      boarding_house.room_type,
      boarding_house.available_rooms,
      boarding_house.latitude,
      boarding_house.longitude,
      case
        when university_latitude is not null and university_longitude is not null then
          6371 * 2 * asin(sqrt(
            power(sin(radians((boarding_house.latitude - university_latitude)::double precision) / 2), 2)
            + cos(radians(university_latitude::double precision))
              * cos(radians(boarding_house.latitude::double precision))
              * power(sin(radians((boarding_house.longitude - university_longitude)::double precision) / 2), 2)
          ))
        else null
      end as distance_km
    from public.boarding_houses as boarding_house
    where boarding_house.status = 'approved'
      and boarding_house.available_rooms >= greatest(coalesce(minimum_available_rooms, 1), 1)
      and (
        nullif(trim(search_text), '') is null
        or to_tsvector(
          'simple',
          boarding_house.title || ' ' || coalesce(boarding_house.barangay, '') || ' '
            || boarding_house.address_line || ' ' || boarding_house.description
        ) @@ websearch_to_tsquery('simple', search_text)
      )
      and (
        nullif(trim(selected_barangay), '') is null
        or lower(trim(boarding_house.barangay)) = lower(trim(selected_barangay))
      )
      and (maximum_monthly_rent is null or boarding_house.monthly_rent <= maximum_monthly_rent)
      and (selected_room_type is null or boarding_house.room_type = selected_room_type)
      and (
        selected_facility_id is null
        or exists (
          select 1
          from public.boarding_house_facilities
          where boarding_house_id = boarding_house.id
            and facility_id = selected_facility_id
        )
      )
      and (
        selected_utility_id is null
        or exists (
          select 1
          from public.boarding_house_utilities
          where boarding_house_id = boarding_house.id
            and utility_id = selected_utility_id
        )
      )
  ), within_distance as (
    select *
    from filtered
    where maximum_distance_km is null
      or (distance_km is not null and distance_km <= maximum_distance_km)
  )
  select
    within_distance.id,
    within_distance.title,
    within_distance.description,
    within_distance.address_line,
    within_distance.barangay,
    within_distance.monthly_rent,
    within_distance.room_type,
    within_distance.available_rooms,
    within_distance.latitude,
    within_distance.longitude,
    round(within_distance.distance_km::numeric, 2),
    count(*) over()
  from within_distance
  order by within_distance.distance_km nulls last,
    within_distance.monthly_rent,
    within_distance.id
  limit least(greatest(coalesce(page_size, 12), 1), 50)
  offset greatest(coalesce(page_offset, 0), 0);
$$;

revoke all on function public.search_public_boarding_houses(
  text, numeric, integer, public.room_type, smallint, smallint,
  numeric, numeric, numeric, integer, integer, text
) from public;
grant execute on function public.search_public_boarding_houses(
  text, numeric, integer, public.room_type, smallint, smallint,
  numeric, numeric, numeric, integer, integer, text
) to anon, authenticated;

create function public.list_public_barangays()
returns table (barangay text)
language sql
stable
security invoker
set search_path = ''
as $$
  select min(trim(boarding_house.barangay)) as barangay
  from public.boarding_houses as boarding_house
  where boarding_house.status = 'approved'
    and boarding_house.available_rooms > 0
    and nullif(trim(boarding_house.barangay), '') is not null
  group by lower(trim(boarding_house.barangay))
  order by lower(min(trim(boarding_house.barangay)));
$$;

revoke all on function public.list_public_barangays() from public;
grant execute on function public.list_public_barangays() to anon, authenticated;
