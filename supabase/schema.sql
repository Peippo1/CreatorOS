create table if not exists public.creator_profiles (user_id uuid primary key references auth.users(id) on delete cascade, profile jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now());
create table if not exists public.source_documents (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null, type text not null, content text not null, signals jsonb not null default '[]'::jsonb, created_at timestamptz not null default now());
alter table public.source_documents add column if not exists signals jsonb not null default '[]'::jsonb;
alter table public.content_experiments add column if not exists source_reference text not null default '';
alter table public.content_experiments add column if not exists source_item_key text not null default '';
create table if not exists public.content_experiments (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, source_document_id uuid references public.source_documents(id) on delete set null, title text not null, audience_segment text not null default '', audience_problem text not null default '', hook text not null default '', platform text not null, format text not null, cta text not null default '', intended_outcome text not null default '', hypothesis text not null default '', draft text not null default '', planned_publish_date date, variant_label text not null default 'Original', status text not null default 'idea', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.performance_snapshots (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, experiment_id uuid not null references public.content_experiments(id) on delete cascade, published_at date not null, views integer not null default 0, watch_time_minutes numeric, likes integer not null default 0, comments integer not null default 0, shares integer not null default 0, saves integer not null default 0, clicks integer not null default 0, signups integer not null default 0, revenue numeric not null default 0, qualified_leads integer not null default 0, created_at timestamptz not null default now());
create table if not exists public.beta_events (id bigint generated always as identity primary key, user_id uuid not null references auth.users(id) on delete cascade, name text not null, occurred_at timestamptz not null default now());
create table if not exists public.rate_limit_buckets (bucket_key text primary key, count integer not null, reset_at timestamptz not null);
create or replace function public.consume_generation_rate_limit(bucket_key text, window_seconds integer, max_requests integer) returns table(allowed boolean, retry_after_seconds integer) language plpgsql security definer as $$
declare current_count integer; current_reset timestamptz;
begin
  insert into public.rate_limit_buckets as bucket (bucket_key, count, reset_at) values ($1, 1, now() + make_interval(secs => $2)) on conflict (bucket_key) do update set count = case when bucket.reset_at <= now() then 1 else bucket.count + 1 end, reset_at = case when bucket.reset_at <= now() then now() + make_interval(secs => $2) else bucket.reset_at end returning count, reset_at into current_count, current_reset;
  if current_count > $3 then update public.rate_limit_buckets set count = $3 where bucket_key = $1; return query select false, greatest(1, ceil(extract(epoch from current_reset - now()))::integer); else return query select true, 0; end if;
end;
$$;
alter table public.creator_profiles enable row level security;
alter table public.source_documents enable row level security;
alter table public.content_experiments enable row level security;
alter table public.performance_snapshots enable row level security;
alter table public.beta_events enable row level security;
alter table public.rate_limit_buckets enable row level security;
drop policy if exists "owner profiles" on public.creator_profiles;
drop policy if exists "owner sources" on public.source_documents;
drop policy if exists "owner experiments" on public.content_experiments;
drop policy if exists "owner metrics" on public.performance_snapshots;
drop policy if exists "owner beta events" on public.beta_events;
create policy "owner profiles" on public.creator_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner sources" on public.source_documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner experiments" on public.content_experiments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner metrics" on public.performance_snapshots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner beta events" on public.beta_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
alter function public.consume_generation_rate_limit(text, integer, integer) set search_path = public;
revoke all on function public.consume_generation_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_generation_rate_limit(text, integer, integer) to service_role;

create unique index if not exists source_documents_user_id_id_key on public.source_documents (user_id, id);
create unique index if not exists content_experiments_user_id_id_key on public.content_experiments (user_id, id);
create unique index if not exists performance_snapshots_user_experiment_published_key on public.performance_snapshots (user_id, experiment_id, published_at);
create index if not exists source_documents_user_created_idx on public.source_documents (user_id, created_at desc);
create index if not exists content_experiments_user_created_idx on public.content_experiments (user_id, created_at desc);
create index if not exists performance_snapshots_user_published_idx on public.performance_snapshots (user_id, published_at desc);
create index if not exists performance_snapshots_experiment_published_idx on public.performance_snapshots (experiment_id, published_at desc);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'content_experiments_source_owner_fkey') then
    alter table public.content_experiments
      add constraint content_experiments_source_owner_fkey
      foreign key (user_id, source_document_id)
      references public.source_documents (user_id, id)
      on delete set null (source_document_id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'performance_snapshots_nonnegative_metrics') then
    alter table public.performance_snapshots
      add constraint performance_snapshots_nonnegative_metrics
      check (views >= 0 and likes >= 0 and comments >= 0 and shares >= 0 and saves >= 0 and clicks >= 0 and signups >= 0 and revenue >= 0 and qualified_leads >= 0 and (watch_time_minutes is null or watch_time_minutes >= 0))
      not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'content_experiments_valid_status') then
    alter table public.content_experiments
      add constraint content_experiments_valid_status
      check (status in ('idea', 'drafting', 'ready', 'published', 'reviewed'))
      not valid;
  end if;
end $$;
