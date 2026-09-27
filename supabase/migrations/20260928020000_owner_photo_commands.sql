alter table public.listing_photos
drop constraint listing_photos_boarding_house_id_position_key;

alter table public.listing_photos
add constraint listing_photos_boarding_house_position_unique
unique (boarding_house_id, position)
deferrable initially immediate;

create function public.replace_listing_photo_details(
  target_id uuid,
  target_photo_ids uuid[],
  target_alt_texts text[]
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_photo_ids uuid[];
  current_alt_texts text[];
  normalized_alt_texts text[];
begin
  perform public.assert_current_owner_listing(target_id);

  if target_photo_ids is null
    or target_alt_texts is null
    or cardinality(target_photo_ids) <> cardinality(target_alt_texts)
    or cardinality(target_photo_ids) > 10
  then
    raise exception 'Photo details must contain matching values for at most 10 photos.'
      using errcode = '22023';
  end if;

  if cardinality(target_photo_ids) <> (
    select count(distinct photo_id) from unnest(target_photo_ids) as photo_id
  ) then
    raise exception 'Photo selection contains duplicates.' using errcode = '22023';
  end if;

  if cardinality(target_photo_ids) <> (
    select count(*)
    from public.listing_photos
    where boarding_house_id = target_id
      and id = any(target_photo_ids)
  ) or cardinality(target_photo_ids) <> (
    select count(*) from public.listing_photos where boarding_house_id = target_id
  ) then
    raise exception 'Photo selection must contain every photo for this boarding house.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(target_alt_texts) as alt_text
    where char_length(trim(alt_text)) not between 3 and 200
  ) then
    raise exception 'Photo alternative text must contain between 3 and 200 characters.'
      using errcode = '22023';
  end if;

  select coalesce(array_agg(trim(alt_text) order by position), '{}'::text[])
  into normalized_alt_texts
  from unnest(target_alt_texts) with ordinality as photo(alt_text, position);

  select
    coalesce(array_agg(id order by position), '{}'::uuid[]),
    coalesce(array_agg(alt_text order by position), '{}'::text[])
  into current_photo_ids, current_alt_texts
  from public.listing_photos
  where boarding_house_id = target_id;

  if target_photo_ids = current_photo_ids and normalized_alt_texts = current_alt_texts then
    return cardinality(target_photo_ids);
  end if;

  set constraints public.listing_photos_boarding_house_position_unique deferred;

  update public.listing_photos as stored
  set position = desired.position,
      alt_text = desired.alt_text
  from (
    select photo_id, trim(alt_text) as alt_text, position::integer
    from unnest(target_photo_ids, target_alt_texts) with ordinality
      as photo(photo_id, alt_text, position)
  ) as desired
  where stored.id = desired.photo_id
    and stored.boarding_house_id = target_id;

  return cardinality(target_photo_ids);
end;
$$;

revoke all on function public.replace_listing_photo_details(uuid, uuid[], text[])
from public, anon;
grant execute on function public.replace_listing_photo_details(uuid, uuid[], text[])
to authenticated;
