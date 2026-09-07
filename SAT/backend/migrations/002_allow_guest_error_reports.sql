-- Apply once in Supabase SQL Editor for an existing project.
-- Guest reports are stored with a NULL user_id; authenticated reports retain
-- their account association.

begin;

alter table public.error_reports
  alter column user_id drop not null;

commit;
