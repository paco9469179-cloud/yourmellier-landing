-- Migrazione: sostituisce solo public.survey_responses con lo schema v2.
-- Esegui nel SQL Editor Supabase se il DB esiste già (non serve se usi da zero sql/beta_users.sql).
-- ATTENZIONE: DROP elimina i dati della tabella precedente.

drop policy if exists survey_insert_blocked on public.survey_responses;
drop policy if exists survey_select_service_role on public.survey_responses;

drop table if exists public.survey_responses cascade;

create table public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  clarity_score integer
    check (clarity_score between 1 and 5),
  ease_of_use_score integer
    check (ease_of_use_score between 1 and 5),
  first_impression text,

  relevance_score integer
    check (relevance_score between 1 and 5),
  explanation_clarity text
    check (explanation_clarity in ('clear', 'partial', 'unclear')),
  suggestions_improvement text,

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

  amazon_link_usefulness integer
    check (amazon_link_usefulness between 1 and 5),
  purchase_confidence text
    check (purchase_confidence in ('yes', 'no', 'depends_on_price')),
  clicked_purchase_link boolean,

  real_situation_usefulness integer
    check (real_situation_usefulness between 1 and 5),
  future_usage_likelihood integer
    check (future_usage_likelihood between 1 and 5),
  nps_score integer
    check (nps_score between 0 and 10),

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
  'true = bozza; false = invio completo.';

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
