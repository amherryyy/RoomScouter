create function public.resolve_report(
  target_id uuid,
  decision public.report_status,
  note text
)
returns public.reports
language plpgsql
security definer
set search_path = ''
as $$
declare
  report public.reports;
  normalized_note text := nullif(trim(note), '');
begin
  if not public.current_user_is_admin() then
    raise exception 'Only administrators can resolve reports.' using errcode = '42501';
  end if;

  if decision not in ('resolved', 'dismissed') then
    raise exception 'Reports may only be resolved or dismissed.' using errcode = '22023';
  end if;

  if normalized_note is null or char_length(normalized_note) not between 3 and 1000 then
    raise exception 'A resolution note between 3 and 1000 characters is required.' using errcode = '22023';
  end if;

  select * into report
  from public.reports
  where id = target_id
  for update;

  if report.id is null then
    raise exception 'Report was not found.' using errcode = 'P0002';
  end if;

  if report.status <> 'open' then
    raise exception 'Only open reports can receive an outcome.' using errcode = '22023';
  end if;

  update public.reports
  set status = decision,
      resolved_by = (select auth.uid()),
      resolved_at = now(),
      resolution_note = normalized_note
  where id = target_id
  returning * into report;

  return report;
end;
$$;

revoke all on function public.resolve_report(uuid, public.report_status, text)
from public, anon;
grant execute on function public.resolve_report(uuid, public.report_status, text)
to authenticated;
