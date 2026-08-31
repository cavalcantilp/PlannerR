-- PlannerR — schéma de base de données Supabase
-- À exécuter dans Supabase Dashboard > SQL Editor (une seule fois par projet).

create extension if not exists "pgcrypto";

create type public.app_role as enum ('manager', 'employee');
create type public.leave_status as enum ('En attente', 'Approuvé', 'Refusé');

-- Un profil par utilisateur authentifié (salarié ou manager)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  department text not null default '',
  job_title text not null default '',
  color text not null default '#6366f1',
  role public.app_role not null default 'employee',
  balance_paid numeric not null default 25,
  balance_rtt numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_manager(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'manager'
  );
$$;

-- Un salarié voit son propre profil, tout profil manager (pour identifier son
-- interlocuteur dans les commentaires), et un manager voit tout le monde.
create policy "Profiles viewable by owner, managers, or manager profiles"
  on public.profiles for select
  using (auth.uid() = id or public.is_manager(auth.uid()) or role = 'manager');

-- Un salarié peut modifier son propre profil, un manager peut modifier
-- n'importe quel profil (ex: promouvoir un salarié, ajuster ses soldes).
-- Le rôle lui-même est protégé séparément par le trigger ci-dessous : cette
-- policy seule ne suffirait pas à empêcher un salarié de s'auto-promouvoir.
create policy "Users update own profile, managers update any"
  on public.profiles for update
  using (auth.uid() = id or public.is_manager(auth.uid()));

create policy "Users insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Empêche toute auto-promotion : seul un manager déjà en place peut changer
-- le rôle d'un profil (le sien ou celui d'un tiers). Ceci s'applique même si
-- la requête d'update passe directement par l'API Supabase (pas seulement
-- via l'interface de l'app), c'est la vraie barrière de sécurité.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_manager(auth.uid()) then
    raise exception 'Seul un manager peut modifier le rôle d''un profil.';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- Crée automatiquement le profil à l'inscription. Le rôle n'est JAMAIS lu
-- depuis les métadonnées envoyées par le client (elles sont modifiables par
-- n'importe qui) : le tout premier compte créé devient manager, tous les
-- suivants sont salariés par défaut. Un manager peut ensuite promouvoir
-- quelqu'un via l'écran Salariés.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_role public.app_role;
begin
  if exists (select 1 from public.profiles) then
    assigned_role := 'employee';
  else
    assigned_role := 'manager';
  end if;

  insert into public.profiles (id, first_name, last_name, department, job_title, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    coalesce(new.raw_user_meta_data ->> 'department', ''),
    coalesce(new.raw_user_meta_data ->> 'job_title', ''),
    assigned_role
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Demandes de congés
create table public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  start_date date not null,
  end_date date not null,
  days integer not null,
  status public.leave_status not null default 'En attente',
  reason text not null default '',
  created_at timestamptz not null default now()
);

alter table public.leave_requests enable row level security;

create policy "Employees see own requests, managers see all"
  on public.leave_requests for select
  using (auth.uid() = employee_id or public.is_manager(auth.uid()));

create policy "Employees create their own requests"
  on public.leave_requests for insert
  with check (auth.uid() = employee_id);

create policy "Managers update request status"
  on public.leave_requests for update
  using (public.is_manager(auth.uid()));

-- Commentaires sur une demande
create table public.request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.leave_requests (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.request_comments enable row level security;

create policy "Comments visible to request owner or manager"
  on public.request_comments for select
  using (
    public.is_manager(auth.uid())
    or exists (
      select 1 from public.leave_requests r
      where r.id = request_id and r.employee_id = auth.uid()
    )
  );

create policy "Comments insertable by request owner or manager"
  on public.request_comments for insert
  with check (
    auth.uid() = author_id
    and (
      public.is_manager(auth.uid())
      or exists (
        select 1 from public.leave_requests r
        where r.id = request_id and r.employee_id = auth.uid()
      )
    )
  );

-- Notifications in-app
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  audience_role public.app_role,
  audience_profile_id uuid references public.profiles (id) on delete cascade,
  message text not null,
  tone text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Notifications visible to their audience"
  on public.notifications for select
  using (
    audience_profile_id = auth.uid()
    or (audience_role = 'manager' and public.is_manager(auth.uid()))
  );

create policy "Notifications updatable by their audience"
  on public.notifications for update
  using (
    audience_profile_id = auth.uid()
    or (audience_role = 'manager' and public.is_manager(auth.uid()))
  );

create policy "Authenticated users insert notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

-- Active le temps réel (Supabase Realtime) pour le centre de notifications
alter publication supabase_realtime add table public.notifications;
