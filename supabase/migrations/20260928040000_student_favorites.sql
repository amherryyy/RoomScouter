create function public.current_user_is_student()
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
      and role = 'student'
  );
$$;

revoke all on function public.current_user_is_student() from public;
grant execute on function public.current_user_is_student() to authenticated;

create table public.favorites (
  student_id uuid not null references public.profiles (id) on delete cascade,
  boarding_house_id uuid not null references public.boarding_houses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, boarding_house_id)
);

create index favorites_boarding_house_id_idx
on public.favorites (boarding_house_id);

alter table public.favorites enable row level security;
alter table public.favorites force row level security;

revoke all on table public.favorites from public, anon, authenticated;
grant select, insert, delete on table public.favorites to authenticated;

create policy "favorites_select_student"
on public.favorites
for select
to authenticated
using (
  student_id = (select auth.uid())
  and public.current_user_is_student()
);

create policy "favorites_insert_student_public_listing"
on public.favorites
for insert
to authenticated
with check (
  student_id = (select auth.uid())
  and public.current_user_is_student()
  and exists (
    select 1
    from public.boarding_houses
    where id = boarding_house_id
      and status = 'approved'
      and available_rooms > 0
  )
);

create policy "favorites_delete_student"
on public.favorites
for delete
to authenticated
using (
  student_id = (select auth.uid())
  and public.current_user_is_student()
);
