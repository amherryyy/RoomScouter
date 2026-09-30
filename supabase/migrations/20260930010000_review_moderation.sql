create type public.review_moderation_action as enum ('hidden', 'restored');

create table public.review_moderation_events (
  id bigint generated always as identity primary key,
  review_id uuid references public.reviews (id) on delete set null,
  boarding_house_id uuid not null references public.boarding_houses (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  action public.review_moderation_action not null,
  reason text not null check (char_length(trim(reason)) between 3 and 1000),
  created_at timestamptz not null default now()
);

create index review_moderation_events_review_created_at_idx
on public.review_moderation_events (review_id, created_at desc);

create function public.moderate_review(
  target_id uuid,
  decision public.review_status,
  reason text
)
returns public.reviews
language plpgsql
security definer
set search_path = ''
as $$
declare
  review public.reviews;
  normalized_reason text := nullif(trim(reason), '');
  event_action public.review_moderation_action;
begin
  if not public.current_user_is_admin() then
    raise exception 'Only administrators can moderate reviews.' using errcode = '42501';
  end if;

  if normalized_reason is null or char_length(normalized_reason) not between 3 and 1000 then
    raise exception 'A moderation reason between 3 and 1000 characters is required.' using errcode = '22023';
  end if;

  select * into review
  from public.reviews
  where id = target_id
  for update;

  if review.id is null then
    raise exception 'Review was not found.' using errcode = 'P0002';
  end if;

  if not (
    (review.status = 'published' and decision = 'hidden')
    or (review.status = 'hidden' and decision = 'published')
  ) then
    raise exception 'The requested review moderation transition is not allowed.' using errcode = '22023';
  end if;

  if decision = 'hidden' then
    update public.reviews
    set status = 'hidden',
        moderated_by = (select auth.uid()),
        moderated_at = now(),
        moderation_note = normalized_reason
    where id = target_id
    returning * into review;
    event_action := 'hidden';
  else
    update public.reviews
    set status = 'published',
        moderated_by = null,
        moderated_at = null,
        moderation_note = null
    where id = target_id
    returning * into review;
    event_action := 'restored';
  end if;

  insert into public.review_moderation_events (
    review_id,
    boarding_house_id,
    actor_id,
    action,
    reason
  ) values (
    review.id,
    review.boarding_house_id,
    (select auth.uid()),
    event_action,
    normalized_reason
  );

  return review;
end;
$$;

revoke all on function public.moderate_review(uuid, public.review_status, text)
from public, anon;
grant execute on function public.moderate_review(uuid, public.review_status, text)
to authenticated;

alter table public.review_moderation_events enable row level security;
alter table public.review_moderation_events force row level security;

revoke all on table public.review_moderation_events from public, anon, authenticated;
grant select on table public.review_moderation_events to authenticated;

create policy "review_moderation_events_select_admin"
on public.review_moderation_events
for select
to authenticated
using (public.current_user_is_admin());
