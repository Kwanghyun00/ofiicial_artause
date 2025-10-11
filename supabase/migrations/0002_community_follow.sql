create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  genre_focus text[],
  region text,
  cover_image_url text,
  logo_url text,
  website text,
  instagram text,
  youtube text,
  follower_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row
  execute function public.trigger_set_timestamps();

alter table if exists public.performances
  add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create table if not exists public.community_posts (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete set null,
  slug text unique not null,
  title text not null,
  excerpt text,
  body text,
  cover_image_url text,
  tags text[],
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_community_posts_updated_at
  before update on public.community_posts
  for each row
  execute function public.trigger_set_timestamps();

create table if not exists public.organization_followers (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  follower_email text,
  follower_name text,
  follower_type text not null default 'audience' check (follower_type in ('audience','creator')),
  created_at timestamptz not null default now()
);

create unique index if not exists organization_followers_unique_email
  on public.organization_followers (organization_id, follower_email)
  where follower_email is not null;
