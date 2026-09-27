insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  boarding_house_id uuid not null references public.boarding_houses (id) on delete cascade,
  object_path text not null unique check (
    object_path ~* '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png)$'
  ),
  media_type text not null check (media_type in ('image/jpeg', 'image/png')),
  byte_size bigint not null check (byte_size between 1 and 10485760),
  alt_text text not null check (char_length(trim(alt_text)) between 3 and 200),
  position integer not null check (position between 1 and 10),
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (boarding_house_id, position)
);

create index listing_photos_boarding_house_position_idx
on public.listing_photos (boarding_house_id, position);

create function public.current_user_can_manage_listing_photo(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.boarding_houses
    where id::text = split_part(object_name, '/', 2)
      and owner_id::text = split_part(object_name, '/', 1)
      and (
        owner_id = (select auth.uid())
        or public.current_user_is_admin()
      )
  );
$$;

revoke all on function public.current_user_can_manage_listing_photo(text) from public;
grant execute on function public.current_user_can_manage_listing_photo(text) to authenticated;

create function public.validate_listing_photo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  listing_owner_id uuid;
  stored_media_type text;
  stored_byte_size bigint;
begin
  select owner_id into listing_owner_id
  from public.boarding_houses
  where id = new.boarding_house_id
  for update;

  if listing_owner_id is null then
    raise exception 'Boarding house was not found.' using errcode = 'P0002';
  end if;

  if not (
    listing_owner_id = (select auth.uid())
    or public.current_user_is_admin()
  ) then
    raise exception 'Listing photo access is denied.' using errcode = '42501';
  end if;

  if split_part(new.object_path, '/', 1) <> listing_owner_id::text
    or split_part(new.object_path, '/', 2) <> new.boarding_house_id::text
  then
    raise exception 'Listing photo path does not match its owner and boarding house.'
      using errcode = '22023';
  end if;

  select
    metadata ->> 'mimetype',
    (metadata ->> 'size')::bigint
  into stored_media_type, stored_byte_size
  from storage.objects
  where bucket_id = 'listing-photos'
    and name = new.object_path;

  if stored_media_type is null then
    raise exception 'The listing photo object does not exist.' using errcode = 'P0002';
  end if;

  if new.media_type <> stored_media_type or new.byte_size <> stored_byte_size then
    raise exception 'Listing photo metadata does not match the stored object.' using errcode = '22023';
  end if;

  if tg_op = 'INSERT' then
    if new.created_by <> (select auth.uid()) then
      raise exception 'Listing photo creator does not match the current user.' using errcode = '42501';
    end if;

    if (
      select count(*)
      from public.listing_photos
      where boarding_house_id = new.boarding_house_id
    ) >= 10 then
      raise exception 'A boarding house can have at most 10 photos.' using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.validate_listing_photo() from public;

create trigger listing_photos_validate
before insert or update on public.listing_photos
for each row execute function public.validate_listing_photo();

create trigger listing_photos_queue_review
after insert or update or delete on public.listing_photos
for each row execute function public.queue_listing_attribute_review();

alter table public.listing_photos enable row level security;
alter table public.listing_photos force row level security;

revoke all on table public.listing_photos from public, anon, authenticated;
grant select on table public.listing_photos to anon, authenticated;
grant insert, delete on table public.listing_photos to authenticated;
grant update (alt_text, position) on table public.listing_photos to authenticated;

create policy "listing_photos_select_visible_listing"
on public.listing_photos
for select
to anon, authenticated
using (
  exists (
    select 1 from public.boarding_houses
    where boarding_houses.id = listing_photos.boarding_house_id
  )
);

create policy "listing_photos_manage_owner_or_admin"
on public.listing_photos
for all
to authenticated
using (public.current_user_can_manage_listing_photo(object_path))
with check (public.current_user_can_manage_listing_photo(object_path));

create policy "listing_photo_objects_select_visible"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'listing-photos'
  and exists (
    select 1 from public.listing_photos
    where listing_photos.object_path = storage.objects.name
  )
);

create policy "listing_photo_objects_select_managed"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'listing-photos'
  and public.current_user_can_manage_listing_photo(name)
);

create policy "listing_photo_objects_insert_managed"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-photos'
  and name ~* '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png)$'
  and metadata ->> 'mimetype' in ('image/jpeg', 'image/png')
  and (metadata ->> 'size')::bigint between 1 and 10485760
  and public.current_user_can_manage_listing_photo(name)
);

create policy "listing_photo_objects_delete_managed"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'listing-photos'
  and public.current_user_can_manage_listing_photo(name)
);
