-- PALABRAS QUE DESPIERTAN · Sistema comunitario independiente
-- Instalación: base Supabase DEDICADA (NUNCA Contabilidad HERTUR ni SACRAMENTUM).
-- Revisión: requerir validación de seguridad y consentimiento antes de activar en producción.
begin;

create table if not exists public.discussion_subjects (
  kind text not null check (kind in ('mensaje','articulo','tema')),
  subject_id text not null check (length(subject_id) between 3 and 140),
  title text not null check (length(title) between 2 and 240),
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  primary key(kind,subject_id)
);

create table if not exists public.discussion_entries (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id text not null,
  parent_id uuid references public.discussion_entries(id) on delete restrict,
  author_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 48),
  body text not null check (char_length(btrim(body)) between 20 and 2200),
  depth smallint not null default 0 check (depth between 0 and 2),
  status text not null default 'pending' check(status in ('pending','approved','rejected','hidden')),
  consent_confirmed boolean not null default false check(consent_confirmed),
  consent_version integer not null default 1,
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  constraint valid_subject foreign key(subject_type,subject_id)
    references public.discussion_subjects(kind,subject_id) on delete restrict
);

create index if not exists discussion_public_index
 on public.discussion_entries(subject_type,subject_id,created_at,id) where status='approved';
create index if not exists discussion_moderation_index
 on public.discussion_entries(created_at) where status='pending';
create index if not exists discussion_parent_index
 on public.discussion_entries(parent_id);
create index if not exists discussion_author_index
 on public.discussion_entries(author_id,created_at);

create table if not exists public.discussion_reports (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.discussion_entries(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  motive text not null check(motive in ('ofensa','datos_personales','contenido_inapropiado','spam','otro')),
  details text check (details is null or length(details)<=600),
  created_at timestamptz not null default now(),
  resolved boolean not null default false,
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  resolution_note text,
  unique (entry_id,reporter_id)
);

create table if not exists public.discussion_moderators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

create table if not exists public.discussion_audit (
  id bigint generated always as identity primary key,
  entry_id uuid not null references public.discussion_entries(id) on delete cascade,
  moderator_id uuid not null references auth.users(id) on delete restrict,
  former_status text not null,
  new_status text not null,
  note text,
  created_at timestamptz not null default now()
);

-- Se crea únicamente una función de trigger en un esquema NO expuesto.
create schema if not exists private;
revoke all on schema private from public,anon,authenticated;

create or replace function private.validate_discussion_submission()
returns trigger language plpgsql security definer
set search_path = ''
as $$
declare
  parent_record record;
  recent_count integer;
begin
  if (select auth.uid()) is null or new.author_id is distinct from (select auth.uid()) then
    raise exception 'No autorizado a publicar con esta identidad';
  end if;
  if new.status <> 'pending' or new.reviewed_by is not null or new.reviewed_at is not null or not new.consent_confirmed then
    raise exception 'Solo se admiten envíos pendientes de revisión';
  end if;
  if not exists(
    select 1 from public.discussion_subjects s
    where s.kind=new.subject_type and s.subject_id=new.subject_id and s.enabled
  ) then
    raise exception 'La conversación no está habilitada';
  end if;
  if new.parent_id is not null then
    select parent.id,parent.depth,parent.status,parent.subject_type,parent.subject_id
      into parent_record
      from public.discussion_entries parent where parent.id=new.parent_id;
    if not found or parent_record.status<>'approved'
      or parent_record.subject_type<>new.subject_type
      or parent_record.subject_id<>new.subject_id then
      raise exception 'La respuesta no corresponde a un comentario público válido';
    end if;
    new.depth := parent_record.depth+1;
    if new.depth>2 then raise exception 'Se alcanzó el máximo de niveles de respuesta'; end if;
  else
    new.depth:=0;
  end if;
  select count(*) into recent_count from public.discussion_entries
    where author_id=new.author_id and created_at>now()-interval '60 seconds';
  if recent_count>0 then raise exception 'Espera antes de enviar otro mensaje'; end if;
  select count(*) into recent_count from public.discussion_entries
    where author_id=new.author_id and created_at>now()-interval '24 hours';
  if recent_count>=12 then raise exception 'Se alcanzó el límite diario de participaciones'; end if;
  new.created_at:=now();
  new.display_name:=btrim(new.display_name);
  new.body:=btrim(new.body);
  return new;
end;
$$;
revoke all on function private.validate_discussion_submission() from public,anon,authenticated;
create or replace function private.validate_discussion_report()
returns trigger language plpgsql security definer set search_path = '' as $$
declare approved boolean; recent integer;
begin
 if (select auth.uid()) is null or new.reporter_id is distinct from (select auth.uid()) then
  raise exception 'Reporte no autorizado';
 end if;
 select (e.status='approved') into approved from public.discussion_entries e where e.id=new.entry_id;
 if coalesce(approved,false)=false then raise exception 'Solo se pueden reportar publicaciones visibles'; end if;
 select count(*) into recent from public.discussion_reports
  where reporter_id=new.reporter_id and created_at>now()-interval '1 minute';
 if recent>0 then raise exception 'Espera antes de enviar otro reporte'; end if;
 select count(*) into recent from public.discussion_reports
  where reporter_id=new.reporter_id and created_at>now()-interval '24 hours';
 if recent>=20 then raise exception 'Se alcanzó el límite diario de reportes'; end if;
 new.created_at:=now();
 return new;
end;
$$;
revoke all on function private.validate_discussion_report() from public,anon,authenticated;
drop trigger if exists before_discussion_report_insert on public.discussion_reports;
create trigger before_discussion_report_insert before insert on public.discussion_reports
 for each row execute function private.validate_discussion_report();

drop trigger if exists before_discussion_entry_insert on public.discussion_entries;
create trigger before_discussion_entry_insert
before insert on public.discussion_entries
for each row execute function private.validate_discussion_submission();

-- Denegar todo por defecto y habilitar solo las acciones y columnas necesarias.
revoke all on public.discussion_subjects from public,anon,authenticated;
revoke all on public.discussion_entries from public,anon,authenticated;
revoke all on public.discussion_reports from public,anon,authenticated;
revoke all on public.discussion_moderators from public,anon,authenticated;
revoke all on public.discussion_audit from public,anon,authenticated;

alter table public.discussion_subjects enable row level security;
alter table public.discussion_entries enable row level security;
alter table public.discussion_reports enable row level security;
alter table public.discussion_moderators enable row level security;
alter table public.discussion_audit enable row level security;

drop policy if exists subject_public_read on public.discussion_subjects;
create policy subject_public_read on public.discussion_subjects
  for select to anon,authenticated using (enabled);

drop policy if exists comments_public_read on public.discussion_entries;
create policy comments_public_read on public.discussion_entries
  for select to anon,authenticated using (status='approved');

drop policy if exists comments_author_submit on public.discussion_entries;
create policy comments_author_submit on public.discussion_entries
  for insert to authenticated
  with check ((select auth.uid())=author_id and status='pending' and consent_confirmed);

drop policy if exists report_author_submit on public.discussion_reports;
create policy report_author_submit on public.discussion_reports
  for insert to authenticated
  with check ((select auth.uid())=reporter_id);

grant select (kind,subject_id,title,enabled) on public.discussion_subjects to anon,authenticated;
grant select (id,subject_type,subject_id,parent_id,display_name,body,depth,status,created_at)
  on public.discussion_entries to anon,authenticated;
grant insert (subject_type,subject_id,parent_id,author_id,display_name,body,consent_confirmed)
  on public.discussion_entries to authenticated;
grant insert (entry_id,reporter_id,motive,details)
  on public.discussion_reports to authenticated;

grant all on public.discussion_subjects, public.discussion_entries,
 public.discussion_reports,public.discussion_moderators,public.discussion_audit to service_role;
grant usage,select on sequence public.discussion_audit_id_seq to service_role;

-- SOLO los temas expresamente propuestos y el mensaje publicado PD-001 se activan.
insert into public.discussion_subjects(kind,subject_id,title,enabled) values
 ('mensaje','pd-001-dios-ya-lo-sabe','Dios ya lo sabe',true),
 ('tema','orar-cuando-cuesta','Orar cuando cuesta',true),
 ('tema','confiar-en-la-sequia','Confiar en medio de la sequía',true),
 ('tema','perdon-y-camino','El perdón como camino',true),
 ('tema','esperanza-ante-la-perdida','Esperanza ante la pérdida',true),
 ('tema','dios-en-lo-cotidiano','Dios en la vida cotidiana',true),
 ('tema','servir-al-projimo','Servir al prójimo',true)
on conflict (kind,subject_id) do update
  set title=excluded.title,enabled=excluded.enabled;

-- NOTA: ningún ART todavía aprobado. Deben añadirse a discussion_subjects
-- únicamente al publicarse oficialmente en data/public-articles.json.
-- NOTA: asignar al primer moderador después de crear y verificar su cuenta:
-- insert into public.discussion_moderators(user_id) values ('<UUID DE auth.users>');

commit;
