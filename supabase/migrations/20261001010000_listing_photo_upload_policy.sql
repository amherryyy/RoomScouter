-- Storage applies the bucket's MIME type and byte-size limits before accepting an
-- object. Keep the row-level policy focused on identity, ownership, and path shape;
-- object metadata is not guaranteed to exist while the Storage API checks INSERT.
drop policy if exists "listing_photo_objects_insert_managed" on storage.objects;

create policy "listing_photo_objects_insert_managed"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'listing-photos'
  and name ~* '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png)$'
  and split_part(name, '/', 1) = (select auth.uid())::text
  and public.current_user_can_manage_listing_photo(name)
);
