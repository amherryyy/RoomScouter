create type public.review_status as enum ('published', 'hidden');

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  boarding_house_id uuid not null references public.boarding_houses (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) between 3 and 2000),
  status public.review_status not null default 'published',
  moderated_by uuid references public.profiles (id) on delete set null,
  moderated_at timestamptz,
  moderation_note text check (
    moderation_note is null or char_length(trim(moderation_note)) between 3 and 1000
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, boarding_house_id),
  check (
    (status = 'published' and moderated_by is null and moderated_at is null and moderation_note is null)
    or (status = 'hidden' and moderated_by is not null and moderated_at is not null and moderation_note is not null)
  )
);

create index reviews_boarding_house_published_idx
on public.reviews (boarding_house_id, created_at desc)
where status = 'published';

create function public.prepare_student_review_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) = old.student_id and not public.current_user_is_admin() then
    if (new.student_id, new.boarding_house_id, new.status, new.moderated_by, new.moderated_at, new.moderation_note)
      is distinct from
      (old.student_id, old.boarding_house_id, old.status, old.moderated_by, old.moderated_at, old.moderation_note)
    then
      raise exception 'Students may change only their rating and comment.' using errcode = '42501';
    end if;
  end if;
  new.comment := trim(new.comment);
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.prepare_student_review_update() from public;

create trigger reviews_prepare_update
before update on public.reviews
for each row execute function public.prepare_student_review_update();

alter table public.reviews enable row level security;
alter table public.reviews force row level security;

revoke all on table public.reviews from public, anon, authenticated;
grant select on table public.reviews to anon, authenticated;
grant insert (student_id, boarding_house_id, rating, comment) on table public.reviews to authenticated;
grant update (rating, comment) on table public.reviews to authenticated;
grant delete on table public.reviews to authenticated;

create policy "reviews_select_public"
on public.reviews
for select
to anon, authenticated
using (
  status = 'published'
  and exists (
    select 1
    from public.boarding_houses
    where id = boarding_house_id
      and status = 'approved'
      and available_rooms > 0
  )
);

create policy "reviews_select_student_own"
on public.reviews
for select
to authenticated
using (student_id = (select auth.uid()) and public.current_user_is_student());

create policy "reviews_select_admin"
on public.reviews
for select
to authenticated
using (public.current_user_is_admin());

create policy "reviews_insert_student_public_listing"
on public.reviews
for insert
to authenticated
with check (
  student_id = (select auth.uid())
  and public.current_user_is_student()
  and status = 'published'
  and exists (
    select 1
    from public.boarding_houses
    where id = boarding_house_id
      and status = 'approved'
      and available_rooms > 0
  )
);

create policy "reviews_update_student_own"
on public.reviews
for update
to authenticated
using (student_id = (select auth.uid()) and public.current_user_is_student())
with check (student_id = (select auth.uid()) and public.current_user_is_student());

create policy "reviews_delete_student_own"
on public.reviews
for delete
to authenticated
using (student_id = (select auth.uid()) and public.current_user_is_student());
