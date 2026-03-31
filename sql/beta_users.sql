-- Schema completo progetto beta landing (Supabase)
-- Esegui in Supabase SQL Editor in una singola query.
-- Nota: timestamptz salva sempre in UTC internamente.
set timezone = 'UTC';

-- Pulizia preventiva (ordine inverso di dipendenze logiche)
drop table if exists public.suggestions;
drop table if exists public.survey_responses;
drop table if exists public.beta_users;

-- ============================================================
-- TABELLA 1: beta_users
-- Utenti beta gestiti manualmente dall'admin.
-- ============================================================
create table public.beta_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  last_login timestamptz null
);

comment on table public.beta_users is
  'Utenti beta manuali; password_hash (bcrypt) generato lato server.';

alter table public.beta_users enable row level security;

-- Nessun accesso client pubblico.
create policy beta_users_insert_blocked
  on public.beta_users
  for insert
  to anon, authenticated
  with check (false);

create policy beta_users_select_service_role
  on public.beta_users
  for select
  to service_role
  using (true);

-- ============================================================
-- TABELLA 2: survey_responses
-- Risposte al questionario beta.
-- ============================================================
create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  is_useful boolean not null,
  preferred_platform text not null
    check (preferred_platform in ('web', 'mobile', 'both', 'neither')),
  improvements jsonb not null default '{"ui":[],"ux":[],"features":[],"data_quality":[]}'::jsonb,
  additional_feedback text null
    check (char_length(additional_feedback) <= 2000),
  language text not null
    check (language in ('en', 'it', 'fr', 'de', 'es')),
  user_agent text null,
  referrer text null,
  session_id text null,
  ip_address text null
);

comment on table public.survey_responses is
  'Questionario beta utenti. Inserimento consentito solo da backend/Edge Function con service role.';

create index idx_survey_created on public.survey_responses (created_at desc);
create index idx_survey_useful on public.survey_responses (is_useful);
create index idx_survey_platform on public.survey_responses (preferred_platform);
create index idx_survey_language on public.survey_responses (language);

alter table public.survey_responses enable row level security;

-- INSERT bloccato dal client (anon/authenticated); inserimento solo via service role.
create policy survey_insert_blocked
  on public.survey_responses
  for insert
  to anon, authenticated
  with check (false);

create policy survey_select_service_role
  on public.survey_responses
  for select
  to service_role
  using (true);

-- ============================================================
-- TABELLA 3: suggestions
-- Suggerimenti liberi da form pubblico.
-- ============================================================
create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text null
    check (char_length(name) <= 100),
  email text null,
  category text not null
    check (category in ('bug', 'feature', 'improvement', 'other')),
  suggestion text not null
    check (char_length(suggestion) <= 2000),
  language text not null
    check (language in ('en', 'it', 'fr', 'de', 'es')),
  user_agent text null,
  session_id text null,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'implemented', 'rejected'))
);

comment on table public.suggestions is
  'Suggerimenti utenti beta; raccolta via backend/Edge Function con validazione server-side.';

create index idx_suggestions_created on public.suggestions (created_at desc);
create index idx_suggestions_category on public.suggestions (category);
create index idx_suggestions_status on public.suggestions (status);

alter table public.suggestions enable row level security;

-- INSERT bloccato dal client (anon/authenticated); inserimento solo via service role.
create policy suggestions_insert_blocked
  on public.suggestions
  for insert
  to anon, authenticated
  with check (false);

create policy suggestions_select_service_role
  on public.suggestions
  for select
  to service_role
  using (true);
