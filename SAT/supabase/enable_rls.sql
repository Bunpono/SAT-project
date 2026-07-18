-- Apply once in Supabase SQL Editor for the existing production project.
-- The FastAPI backend uses a server-only secret key; browser clients retain
-- no direct access to these application tables.

begin;

alter table public.users enable row level security;
alter table public.analysis_history enable row level security;
alter table public.error_reports enable row level security;

revoke all on table public.users, public.analysis_history, public.error_reports
from anon, authenticated;

commit;
