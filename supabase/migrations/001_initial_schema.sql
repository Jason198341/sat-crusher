-- SAT Crusher Database Schema
-- Run this in Supabase SQL Editor

-- ─── Profiles ────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  target_score integer not null default 1400,
  test_date date,
  streak integer not null default 0,
  last_active_date date,
  lang text not null default 'en' check (lang in ('en', 'ko')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile" on profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- ─── Questions ───────────────────────────────
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('rw', 'math')),
  domain text not null,
  topic_id text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  passage text,
  stimulus text not null,
  choices jsonb not null, -- [{label, text}]
  correct_answer integer not null, -- 0-3
  explanation text not null default '',
  explanation_ko text not null default '',
  tags text[] not null default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table questions enable row level security;
drop policy if exists "Anyone can read questions" on questions;
create policy "Anyone can read questions" on questions for select using (true);
drop policy if exists "Auth users can create questions" on questions;
create policy "Auth users can create questions" on questions for insert with check (auth.uid() is not null);

-- ─── Test Sessions ───────────────────────────
create table if not exists test_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('practice', 'mock')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  current_module text,
  score jsonb, -- {total, rw: {scaled, ...}, math: {scaled, ...}}
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table test_sessions enable row level security;
drop policy if exists "Users can manage own sessions" on test_sessions;
create policy "Users can manage own sessions" on test_sessions for all using (auth.uid() = user_id);

-- ─── Answers ─────────────────────────────────
create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references test_sessions(id) on delete cascade,
  question_id uuid not null references questions(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  selected_answer integer, -- null if skipped
  is_correct boolean not null default false,
  time_spent_seconds integer not null default 0,
  flagged boolean not null default false,
  module_type text,
  created_at timestamptz not null default now()
);

alter table answers enable row level security;
drop policy if exists "Users can manage own answers" on answers;
create policy "Users can manage own answers" on answers for all using (auth.uid() = user_id);

-- ─── Review Queue (SM-2) ────────────────────
create table if not exists review_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references questions(id),
  ease_factor real not null default 2.5,
  interval integer not null default 0,
  repetitions integer not null default 0,
  next_review_date date not null default current_date,
  last_review_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table review_queue enable row level security;
drop policy if exists "Users can manage own reviews" on review_queue;
create policy "Users can manage own reviews" on review_queue for all using (auth.uid() = user_id);

-- Index for fast due-date lookups
create index if not exists idx_review_queue_due on review_queue(user_id, next_review_date);

-- ─── Daily Stats ─────────────────────────────
create table if not exists daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  questions_attempted integer not null default 0,
  questions_correct integer not null default 0,
  time_spent_minutes integer not null default 0,
  tests_completed integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

alter table daily_stats enable row level security;
drop policy if exists "Users can manage own stats" on daily_stats;
create policy "Users can manage own stats" on daily_stats for all using (auth.uid() = user_id);

-- ─── Chat Messages ──────────────────────────
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  session_id uuid references test_sessions(id),
  created_at timestamptz not null default now()
);

alter table chat_messages enable row level security;
drop policy if exists "Users can manage own messages" on chat_messages;
create policy "Users can manage own messages" on chat_messages for all using (auth.uid() = user_id);

-- ─── Auto-create profile on signup ──────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
