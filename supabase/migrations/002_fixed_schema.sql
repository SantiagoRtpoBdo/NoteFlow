-- =============================================================
-- NoteFlow Database Schema (execution-order fixed)
-- Creates all tables first, then policies and triggers
-- =============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ===================== TABLES =====================

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null unique,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  icon       text,
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  role         text not null default 'viewer' check (role in ('owner', 'editor', 'viewer')),
  created_at   timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create table if not exists public.pages (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  parent_id    uuid references public.pages(id) on delete set null,
  title        text not null default 'Untitled',
  content      jsonb,
  icon         text default '📄',
  cover_image  text,
  is_archived  boolean not null default false,
  is_published boolean not null default false,
  created_by   uuid not null references public.profiles(id),
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.page_shares (
  id                  uuid primary key default uuid_generate_v4(),
  page_id             uuid not null references public.pages(id) on delete cascade,
  shared_with_email   text not null,
  shared_with_user_id uuid references public.profiles(id),
  role                text not null default 'viewer' check (role in ('editor', 'viewer')),
  created_at          timestamptz not null default now(),
  unique(page_id, shared_with_email)
);

-- ===================== INDEXES =====================

create index if not exists idx_pages_workspace on public.pages(workspace_id);
create index if not exists idx_pages_parent on public.pages(parent_id);
create index if not exists idx_pages_search on public.pages using gin(to_tsvector('english', title));

-- ===================== ENABLE RLS =====================

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.pages enable row level security;
alter table public.page_shares enable row level security;

-- ===================== PROFILES POLICIES =====================

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ===================== WORKSPACES POLICIES =====================

create policy "Workspace members can view workspace"
  on public.workspaces for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = id and wm.user_id = auth.uid()
    )
  );

create policy "Workspace owner can update workspace"
  on public.workspaces for update
  using (owner_id = auth.uid());

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Workspace owner can delete workspace"
  on public.workspaces for delete
  using (owner_id = auth.uid());

-- ===================== WORKSPACE MEMBERS POLICIES =====================

create policy "Members can view members of their workspaces"
  on public.workspace_members for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_id and wm.user_id = auth.uid()
    )
  );

create policy "Workspace owners can manage members"
  on public.workspace_members for all
  using (
    exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = auth.uid()
    )
  );

create policy "Users can insert themselves as owners"
  on public.workspace_members for insert
  with check (user_id = auth.uid());

-- ===================== PAGES POLICIES =====================

create policy "Workspace members can view pages"
  on public.pages for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = pages.workspace_id
        and wm.user_id = auth.uid()
    )
    or is_published = true
  );

create policy "Editors and owners can create pages"
  on public.pages for insert
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = pages.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'editor')
    )
  );

create policy "Editors and owners can update pages"
  on public.pages for update
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = pages.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'editor')
    )
  );

create policy "Owners can delete pages"
  on public.pages for delete
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = pages.workspace_id
        and wm.user_id = auth.uid()
        and wm.role = 'owner'
    )
    or created_by = auth.uid()
  );

-- ===================== PAGE SHARES POLICIES =====================

create policy "Page creators and workspace owners can manage shares"
  on public.page_shares for all
  using (
    exists (
      select 1 from public.pages p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = page_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'editor')
    )
  );

create policy "Users can view shares for their pages"
  on public.page_shares for select
  using (
    shared_with_user_id = auth.uid()
    or exists (
      select 1 from public.pages p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = page_id and wm.user_id = auth.uid()
    )
  );

-- ===================== FUNCTIONS & TRIGGERS =====================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists update_workspaces_updated_at on public.workspaces;
create trigger update_workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.update_updated_at();

drop trigger if exists update_pages_updated_at on public.pages;
create trigger update_pages_updated_at
  before update on public.pages
  for each row execute function public.update_updated_at();
