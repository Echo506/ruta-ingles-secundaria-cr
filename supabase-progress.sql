create table if not exists student_progress (
  user_id uuid primary key,
  email text,
  display_name text,
  completed_levels jsonb default '[]'::jsonb,
  completed_challenges jsonb default '[]'::jsonb,
  reading_scores jsonb default '[]'::jsonb,
  listening_scores jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

alter table student_progress enable row level security;

create policy "Users can view own progress"
on student_progress
for select
using (auth.uid() is not null and auth.uid() = user_id);

create policy "Users can insert own progress"
on student_progress
for insert
with check (auth.uid() is not null and auth.uid() = user_id);

create policy "Users can update own progress"
on student_progress
for update
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);