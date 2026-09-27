create function public.assert_current_owner_listing(target_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.current_user_is_owner() or not exists (
    select 1
    from public.boarding_houses
    where id = target_id
      and owner_id = (select auth.uid())
  ) then
    raise exception 'Boarding house was not found.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.assert_current_owner_listing(uuid) from public;

create function public.replace_boarding_house_facilities(
  target_id uuid,
  target_facility_ids smallint[]
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_ids smallint[];
  current_ids smallint[];
begin
  perform public.assert_current_owner_listing(target_id);

  if target_facility_ids is null then
    raise exception 'Facility selection is required.' using errcode = '22023';
  end if;

  if cardinality(target_facility_ids) <> (
    select count(distinct facility_id) from unnest(target_facility_ids) as facility_id
  ) then
    raise exception 'Facility selection contains duplicates.' using errcode = '22023';
  end if;

  if cardinality(target_facility_ids) <> (
    select count(*) from public.facilities where id = any(target_facility_ids)
  ) then
    raise exception 'Facility selection contains an unknown value.' using errcode = '22023';
  end if;

  select coalesce(array_agg(facility_id order by facility_id), '{}'::smallint[])
  into normalized_ids
  from unnest(target_facility_ids) as facility_id;

  select coalesce(array_agg(facility_id order by facility_id), '{}'::smallint[])
  into current_ids
  from public.boarding_house_facilities
  where boarding_house_id = target_id;

  if normalized_ids = current_ids then
    return cardinality(normalized_ids);
  end if;

  delete from public.boarding_house_facilities where boarding_house_id = target_id;
  insert into public.boarding_house_facilities (boarding_house_id, facility_id)
  select target_id, facility_id from unnest(normalized_ids) as facility_id;

  return cardinality(normalized_ids);
end;
$$;

revoke all on function public.replace_boarding_house_facilities(uuid, smallint[])
from public, anon;
grant execute on function public.replace_boarding_house_facilities(uuid, smallint[])
to authenticated;

create function public.replace_boarding_house_utilities(
  target_id uuid,
  target_utility_ids smallint[],
  target_included_values boolean[],
  target_detail_values text[]
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_ids smallint[];
  normalized_included boolean[];
  normalized_details text[];
  current_ids smallint[];
  current_included boolean[];
  current_details text[];
begin
  perform public.assert_current_owner_listing(target_id);

  if target_utility_ids is null
    or target_included_values is null
    or target_detail_values is null
    or cardinality(target_utility_ids) <> cardinality(target_included_values)
    or cardinality(target_utility_ids) <> cardinality(target_detail_values)
  then
    raise exception 'Utility selections must have matching values.' using errcode = '22023';
  end if;

  if cardinality(target_utility_ids) <> (
    select count(distinct utility_id) from unnest(target_utility_ids) as utility_id
  ) then
    raise exception 'Utility selection contains duplicates.' using errcode = '22023';
  end if;

  if cardinality(target_utility_ids) <> (
    select count(*) from public.utilities where id = any(target_utility_ids)
  ) then
    raise exception 'Utility selection contains an unknown value.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(target_detail_values) as detail
    where nullif(trim(detail), '') is not null
      and char_length(trim(detail)) > 240
  ) then
    raise exception 'Utility details are too long.' using errcode = '22023';
  end if;

  select
    coalesce(array_agg(selection.utility_id order by selection.utility_id), '{}'::smallint[]),
    coalesce(array_agg(selection.is_included order by selection.utility_id), '{}'::boolean[]),
    coalesce(array_agg(nullif(trim(selection.details), '') order by selection.utility_id), '{}'::text[])
  into normalized_ids, normalized_included, normalized_details
  from unnest(target_utility_ids, target_included_values, target_detail_values)
    as selection(utility_id, is_included, details);

  select
    coalesce(array_agg(utility_id order by utility_id), '{}'::smallint[]),
    coalesce(array_agg(is_included order by utility_id), '{}'::boolean[]),
    coalesce(array_agg(details order by utility_id), '{}'::text[])
  into current_ids, current_included, current_details
  from public.boarding_house_utilities
  where boarding_house_id = target_id;

  if normalized_ids = current_ids
    and normalized_included = current_included
    and normalized_details = current_details
  then
    return cardinality(normalized_ids);
  end if;

  delete from public.boarding_house_utilities where boarding_house_id = target_id;
  insert into public.boarding_house_utilities (
    boarding_house_id,
    utility_id,
    is_included,
    details
  )
  select target_id, utility_id, is_included, details
  from unnest(normalized_ids, normalized_included, normalized_details)
    as selection(utility_id, is_included, details);

  return cardinality(normalized_ids);
end;
$$;

revoke all on function public.replace_boarding_house_utilities(uuid, smallint[], boolean[], text[])
from public, anon;
grant execute on function public.replace_boarding_house_utilities(uuid, smallint[], boolean[], text[])
to authenticated;

create function public.replace_house_rules(target_id uuid, target_rules text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_rules text[];
  current_rules text[];
begin
  perform public.assert_current_owner_listing(target_id);

  if target_rules is null or cardinality(target_rules) > 100 then
    raise exception 'House rules must contain at most 100 entries.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(target_rules) as rule_text
    where char_length(trim(rule_text)) not between 3 and 500
  ) then
    raise exception 'Each house rule must contain between 3 and 500 characters.'
      using errcode = '22023';
  end if;

  select coalesce(array_agg(trim(rule_text) order by position), '{}'::text[])
  into normalized_rules
  from unnest(target_rules) with ordinality as rule(rule_text, position);

  select coalesce(array_agg(rule_text order by position), '{}'::text[])
  into current_rules
  from public.house_rules
  where boarding_house_id = target_id;

  if normalized_rules = current_rules then
    return cardinality(normalized_rules);
  end if;

  delete from public.house_rules where boarding_house_id = target_id;
  insert into public.house_rules (boarding_house_id, rule_text, position)
  select target_id, rule_text, position
  from unnest(normalized_rules) with ordinality as rule(rule_text, position);

  return cardinality(normalized_rules);
end;
$$;

revoke all on function public.replace_house_rules(uuid, text[]) from public, anon;
grant execute on function public.replace_house_rules(uuid, text[]) to authenticated;
