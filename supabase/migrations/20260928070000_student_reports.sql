create type public.report_target_type as enum ('listing', 'review');
create type public.report_status as enum ('open', 'resolved', 'dismissed');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target_type not null,
  boarding_house_id uuid references public.boarding_houses (id) on delete cascade,
  review_id uuid references public.reviews (id) on delete cascade,
  reason text not null check (char_length(trim(reason)) between 10 and 1000),
  status public.report_status not null default 'open',
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  resolution_note text check (
    resolution_note is null or char_length(trim(resolution_note)) between 3 and 1000
  ),
  created_at timestamptz not null default now(),
  check (
    (target_type = 'listing' and boarding_house_id is not null and review_id is null)
    or (target_type = 'review' and review_id is not null and boarding_house_id is null)
  ),
  check (
    (status = 'open' and resolved_by is null and resolved_at is null and resolution_note is null)
    or (status in ('resolved', 'dismissed') and resolved_by is not null and resolved_at is not null and resolution_note is not null)
  )
);

create unique index reports_open_listing_reporter_idx
on public.reports (reporter_id, boarding_house_id)
where target_type = 'listing' and status = 'open';

create unique index reports_open_review_reporter_idx
on public.reports (reporter_id, review_id)
where target_type = 'review' and status = 'open';

create index reports_open_created_at_idx
on public.reports (created_at)
where status = 'open';

create function public.validate_student_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.reporter_id <> (select auth.uid()) or not public.current_user_is_student() then
    raise exception 'Only students may submit their own reports.' using errcode = '42501';
  end if;

  new.reason := trim(new.reason);

  if new.target_type = 'listing' and not exists (
    select 1
    from public.boarding_houses
    where id = new.boarding_house_id
      and status = 'approved'
      and available_rooms > 0
  ) then
    raise exception 'Only public listings can be reported.' using errcode = '22023';
  end if;

  if new.target_type = 'review' and not exists (
    select 1
    from public.reviews as review
    join public.boarding_houses as boarding_house
      on boarding_house.id = review.boarding_house_id
    where review.id = new.review_id
      and review.status = 'published'
      and boarding_house.status = 'approved'
      and boarding_house.available_rooms > 0
  ) then
    raise exception 'Only published reviews can be reported.' using errcode = '22023';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_student_report() from public;

create trigger reports_validate_submission
before insert on public.reports
for each row execute function public.validate_student_report();

alter table public.reports enable row level security;
alter table public.reports force row level security;

revoke all on table public.reports from public, anon, authenticated;
grant select on table public.reports to authenticated;
grant insert (reporter_id, target_type, boarding_house_id, review_id, reason)
on table public.reports to authenticated;

create policy "reports_select_reporter"
on public.reports
for select
to authenticated
using (reporter_id = (select auth.uid()) and public.current_user_is_student());

create policy "reports_select_admin"
on public.reports
for select
to authenticated
using (public.current_user_is_admin());

create policy "reports_insert_student"
on public.reports
for insert
to authenticated
with check (
  reporter_id = (select auth.uid())
  and public.current_user_is_student()
  and status = 'open'
);
