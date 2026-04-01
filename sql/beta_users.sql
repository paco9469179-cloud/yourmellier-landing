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
-- Questionario beta v2 (colonne dedicate, allineato a QuestionnaireV2).
-- ============================================================
create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Sezione 1: Prima impressione & onboarding
  clarity_score integer
    check (clarity_score between 1 and 5),
  ease_of_use_score integer
    check (ease_of_use_score between 1 and 5),
  first_impression text,

  -- Sezione 2: Suggerimenti sommelier
  relevance_score integer
    check (relevance_score between 1 and 5),
  explanation_clarity text
    check (explanation_clarity in ('clear', 'partial', 'unclear')),
  suggestions_improvement text,

  -- Sezione 3: Usabilità & UX
  navigation_score integer
    check (navigation_score between 1 and 5),
  least_intuitive_part text
    check (
      least_intuitive_part in (
        'dish_input',
        'filtering',
        'wine_card',
        'purchase_link',
        'other'
      )
    ),
  least_intuitive_other text,
  technical_issues text,

  -- Sezione 4: Esperienza acquisto
  amazon_link_usefulness integer
    check (amazon_link_usefulness between 1 and 5),
  purchase_confidence text
    check (purchase_confidence in ('yes', 'no', 'depends_on_price')),
  clicked_purchase_link boolean,

  -- Sezione 5: Valore percepito (Likert 1–5 per riuso futuro, come in app)
  real_situation_usefulness integer
    check (real_situation_usefulness between 1 and 5),
  future_usage_likelihood integer
    check (future_usage_likelihood between 1 and 5),
  nps_score integer
    check (nps_score between 0 and 10),

  -- Sezione 6: Feedback aperto / modalità
  preferred_platform text
    check (preferred_platform in ('web', 'mobile_app')),
  most_liked text,
  most_disliked text,
  feature_request text,

  language text not null default 'it'
    check (language in ('en', 'it', 'fr', 'de', 'es')),
  user_agent text,
  referrer text,
  session_id text,
  ip_address inet,
  completed_at timestamptz,
  is_draft boolean not null default false
);

comment on table public.survey_responses is
  'Risposte questionario beta YourMelier; inserimento solo Edge Function (service role).';

comment on column public.survey_responses.nps_score is
  'Net Promoter Score 0–10.';

comment on column public.survey_responses.future_usage_likelihood is
  'Likert 1–5: probabilità di riuso futuro (come questionario v2).';

comment on column public.survey_responses.is_draft is
  'true = bozza (non usato da submit attuale); false = invio completo.';

create index idx_survey_created on public.survey_responses (created_at desc);
create index idx_survey_nps on public.survey_responses (nps_score);
create index idx_survey_platform on public.survey_responses (preferred_platform);
create index idx_survey_language on public.survey_responses (language);
create index idx_survey_completed on public.survey_responses (completed_at desc)
  where completed_at is not null;
create index idx_survey_draft on public.survey_responses (is_draft)
  where is_draft = true;

alter table public.survey_responses enable row level security;

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
