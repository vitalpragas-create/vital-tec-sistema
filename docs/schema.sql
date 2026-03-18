create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  username text not null unique,
  role text not null default 'operador' check (role in ('admin', 'operador')),
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_count integer;
begin
  select count(*) into profile_count from public.profiles;

  insert into public.profiles (id, display_name, username, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    case when profile_count = 0 then 'admin' else 'operador' end,
    'ativo'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_bootstrap_required()
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (select 1 from public.profiles);
$$;

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_profile_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'ativo'
  );
$$;

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  phone text,
  start_date date,
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now()
);

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('equipamento', 'produto_quimico', 'epi', 'ferramenta', 'material_apoio')),
  description text,
  internal_code text,
  total_quantity numeric not null default 0,
  available_quantity numeric not null default 0,
  unit text not null default 'un',
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references inventory_items(id) on delete restrict,
  employee_id uuid not null references employees(id) on delete restrict,
  delivered_by text not null,
  quantity numeric not null default 1,
  delivery_date date not null,
  return_date date,
  notes text,
  status text not null default 'em_uso' check (status in ('em_uso', 'devolvido')),
  signature_data_url text,
  created_at timestamptz not null default now()
);

create table if not exists repairs (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references inventory_items(id) on delete restrict,
  employee_id uuid references employees(id) on delete set null,
  sent_for_repair_date date not null,
  repair_reason text not null,
  return_from_repair_date date,
  final_return_date date,
  status text not null default 'em_reparo' check (status in ('em_reparo', 'devolvido')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table employees enable row level security;
alter table inventory_items enable row level security;
alter table assignments enable row level security;
alter table repairs enable row level security;

drop policy if exists "profiles own select" on public.profiles;
drop policy if exists "profiles admin select" on public.profiles;
drop policy if exists "profiles admin update" on public.profiles;
drop policy if exists "employees authenticated read/write" on employees;
drop policy if exists "inventory authenticated read/write" on inventory_items;
drop policy if exists "assignments authenticated read/write" on assignments;
drop policy if exists "repairs authenticated read/write" on repairs;

create policy "profiles own select"
on public.profiles
for select
using (id = auth.uid() or public.current_profile_role() = 'admin');

create policy "profiles admin update"
on public.profiles
for update
using (public.current_profile_role() = 'admin' and public.current_profile_active())
with check (public.current_profile_role() = 'admin' and public.current_profile_active());

create policy "employees authenticated read/write"
on employees
for all
using (public.current_profile_active())
with check (public.current_profile_active());

create policy "inventory authenticated read/write"
on inventory_items
for all
using (public.current_profile_active())
with check (public.current_profile_active());

create policy "assignments authenticated read/write"
on assignments
for all
using (public.current_profile_active())
with check (public.current_profile_active());

create policy "repairs authenticated read/write"
on repairs
for all
using (public.current_profile_active())
with check (public.current_profile_active());
