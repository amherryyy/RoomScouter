revoke select on table public.reviews from anon, authenticated;
grant select (
  id,
  boarding_house_id,
  rating,
  comment,
  status,
  moderation_note,
  created_at,
  updated_at
) on table public.reviews to anon, authenticated;

create view public.public_reviews
with (security_invoker = true)
as
select
  id,
  boarding_house_id,
  rating,
  comment,
  created_at,
  updated_at
from public.reviews
where status = 'published';

revoke all on table public.public_reviews from public;
grant select on table public.public_reviews to anon, authenticated;

create function public.get_current_student_review(target_id uuid)
returns table (
  id uuid,
  rating smallint,
  comment text,
  status public.review_status,
  moderation_note text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.current_user_is_student() then
    raise exception 'Student access is required.' using errcode = '42501';
  end if;

  return query
  select
    review.id,
    review.rating,
    review.comment,
    review.status,
    review.moderation_note,
    review.created_at,
    review.updated_at
  from public.reviews as review
  where review.boarding_house_id = target_id
    and review.student_id = (select auth.uid());
end;
$$;

revoke all on function public.get_current_student_review(uuid) from public, anon;
grant execute on function public.get_current_student_review(uuid) to authenticated;

create function public.get_public_review_summary(target_id uuid)
returns table (review_count bigint, average_rating numeric)
language sql
stable
security invoker
set search_path = ''
as $$
  select count(*), round(avg(rating), 2)
  from public.reviews
  where boarding_house_id = target_id
    and status = 'published'
    and exists (
      select 1
      from public.boarding_houses
      where id = target_id
        and status = 'approved'
        and available_rooms > 0
    );
$$;

revoke all on function public.get_public_review_summary(uuid) from public;
grant execute on function public.get_public_review_summary(uuid) to anon, authenticated;
