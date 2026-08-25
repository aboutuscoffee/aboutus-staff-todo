create table public.staff_todo_push_subscriptions (
  id bigint generated always as identity primary key,
  staff_key text not null references public.staff(key) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.staff_todo_push_subscriptions enable row level security;

create policy "allow all (anon)" on public.staff_todo_push_subscriptions
  for all
  using (true)
  with check (true);
