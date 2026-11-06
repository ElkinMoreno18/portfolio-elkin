-- ============================================================================
--  Portafolio de Elkin Moreno — esquema de Supabase
--  Pégalo entero en el SQL Editor de Supabase y pulsa "Run".
--  Es idempotente: puedes volver a ejecutarlo sin romper nada.
-- ============================================================================

-- ─────────────────────────────── PROYECTOS ───────────────────────────────

create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,

  -- Contenido bilingüe: la app elige la columna según el idioma activo.
  title_es        text not null default '',
  title_en        text not null default '',
  tagline_es      text not null default '',
  tagline_en      text not null default '',
  description_es  text not null default '',
  description_en  text not null default '',
  role_es         text not null default '',
  role_en         text not null default '',

  tech            text[] not null default '{}',
  category        text not null default 'web'
                  check (category in ('automation','ai','erp','web','ecommerce','data')),

  cover_url       text,
  gallery         text[] not null default '{}',
  repo_url        text,
  demo_url        text,

  -- [{ "value": "-40%", "label_es": "…", "label_en": "…" }]
  metrics         jsonb not null default '[]'::jsonb,

  year            int not null default extract(year from now())::int,
  -- Periodo: "2022 – 2025" (year_start) o "2025 – hoy" (ongoing).
  year_start      int,
  ongoing         boolean not null default false,
  featured        boolean not null default false,
  published       boolean not null default true,
  sort_order      int not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Si la tabla ya existía de una versión anterior, se le añaden las columnas nuevas.
alter table public.projects add column if not exists year_start int;
alter table public.projects add column if not exists ongoing boolean not null default false;

-- El sitio público siempre filtra por published y ordena por estas columnas.
create index if not exists projects_published_idx
  on public.projects (published, featured desc, sort_order asc);

-- ─────────────────────── CONTENIDO DEL SITIO (/admin) ───────────────────────
-- Una fila por sección del portafolio, con su contenido en JSON (los dos
-- idiomas dentro). Mientras una sección no tenga fila, el sitio usa la de
-- src/data/profile.ts.

create table if not exists public.site_content (
  key         text primary key
              check (key in ('profile','about','experience','education','languages','stack')),
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ───────────────────────── MENSAJES DE CONTACTO ─────────────────────────

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  subject     text          check (subject is null or char_length(subject) <= 200),
  -- El límite corta de raíz el spam de payloads gigantes.
  body        text not null check (char_length(body) between 1 and 5000),
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists contact_messages_created_idx
  on public.contact_messages (created_at desc);

-- ───────────────────────── updated_at automático ─────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists site_content_touch_updated_at on public.site_content;
create trigger site_content_touch_updated_at
  before update on public.site_content
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────── PERMISOS ───────────────────────────────
-- Explícitos por si el proyecto no los concede por defecto a las tablas
-- nuevas. Lo que de verdad decide qué filas ve o toca cada uno es RLS (abajo).
grant usage on schema public to anon, authenticated;
grant select on public.projects, public.site_content to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant insert, update, delete on public.projects, public.site_content to authenticated;
grant select, update, delete on public.contact_messages to authenticated;

-- ══════════════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
--  Sin esto, la clave anónima (que va en el bundle del navegador y es
--  pública por diseño) permitiría a cualquiera escribir en tus tablas.
-- ══════════════════════════════════════════════════════════════════════════

alter table public.projects         enable row level security;
alter table public.site_content     enable row level security;
alter table public.contact_messages enable row level security;

-- Proyectos: el mundo lee lo publicado; sólo tú (autenticado) escribes.
drop policy if exists "projects_public_read"  on public.projects;
create policy "projects_public_read"
  on public.projects for select
  to anon, authenticated
  using (published = true);

drop policy if exists "projects_owner_all" on public.projects;
create policy "projects_owner_all"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

-- Contenido: el mundo lo lee (es lo que enseña el sitio); sólo tú lo escribes.
drop policy if exists "content_public_read" on public.site_content;
create policy "content_public_read"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "content_owner_write" on public.site_content;
create policy "content_owner_write"
  on public.site_content for all
  to authenticated
  using (true)
  with check (true);

-- Mensajes: cualquiera puede enviar, sólo tú puedes leerlos.
-- El insert sin select es lo que impide que un visitante lea tu bandeja.
drop policy if exists "messages_anyone_insert" on public.contact_messages;
create policy "messages_anyone_insert"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "messages_owner_read" on public.contact_messages;
create policy "messages_owner_read"
  on public.contact_messages for select
  to authenticated
  using (true);

drop policy if exists "messages_owner_update" on public.contact_messages;
create policy "messages_owner_update"
  on public.contact_messages for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "messages_owner_delete" on public.contact_messages;
create policy "messages_owner_delete"
  on public.contact_messages for delete
  to authenticated
  using (true);

-- ─────────────────── STORAGE: imágenes de proyectos, CV y retrato ───────────────────
-- Un solo bucket público: capturas en la raíz y los archivos del perfil
-- (CV en PDF, retrato) bajo site/.

insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-media');

drop policy if exists "media_owner_insert" on storage.objects;
create policy "media_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-media');

drop policy if exists "media_owner_update" on storage.objects;
create policy "media_owner_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-media');

drop policy if exists "media_owner_delete" on storage.objects;
create policy "media_owner_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-media');

-- ============================================================================
--  Listo. Siguiente paso: Authentication → Users → Add user
--  Crea tu usuario con email y contraseña, y marca "Auto Confirm User".
--  Después desactiva el registro público en Authentication → Providers →
--  Email → "Allow new users to sign up" = OFF, para que nadie más entre.
-- ============================================================================
