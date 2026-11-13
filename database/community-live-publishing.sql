-- PALABRAS QUE DESPIERTAN · Publicación comunitaria con verificación previa
-- Proyecto único: lwuzkjvolxwkxdyafcjv.
-- No se permiten comentarios anónimos ni pendientes de aprobación.
begin;
alter table public.discussion_entries
  alter column status set default 'approved';

create or replace function private.validate_discussion_submission()
returns trigger language plpgsql security definer
set search_path = ''
as $$
declare
  parent_record record;
  recent_count integer;
begin
  if (select auth.uid()) is null or new.author_id is distinct from (select auth.uid()) then
    raise exception 'Debes identificarte para participar';
  end if;
  if not exists (
    select 1 from auth.users u
    where u.id = new.author_id and u.email_confirmed_at is not null
      and u.is_anonymous is not true
  ) then
    raise exception 'Verifica tu correo para poder participar';
  end if;
  if new.status <> 'approved' or new.reviewed_by is not null
    or new.reviewed_at is not null or not new.consent_confirmed then
    raise exception 'Se requiere autorización de datos para publicar';
  end if;
  if not exists (
    select 1 from public.discussion_subjects s
    where s.kind=new.subject_type and s.subject_id=new.subject_id and s.enabled
  ) then
    raise exception 'La conversación no está habilitada';
  end if;

  new.display_name := btrim(new.display_name);
  new.body := btrim(new.body);

  -- Revisiones técnicas de abuso, también obligatorias cuando se evita la API web.
  if new.display_name ~* '(https?://|www\.|@)' or new.body ~* '(https?://|www\.|[[:alnum:]_.+%-]+@[[:alnum:].-]+\.[[:alpha:]]{2,})' then
    raise exception 'No se permiten enlaces o direcciones de correo en participaciones públicas';
  end if;
  if new.body ~ '(.)\1{9,}' then
    raise exception 'La participación contiene repeticiones excesivas';
  end if;
  if new.parent_id is not null then
    select parent.id,parent.depth,parent.status,parent.subject_type,parent.subject_id
    into parent_record
    from public.discussion_entries parent where parent.id=new.parent_id;
    if not found or parent_record.status<>'approved'
      or parent_record.subject_type<>new.subject_type
      or parent_record.subject_id<>new.subject_id then
      raise exception 'La respuesta no corresponde a una participación pública válida';
    end if;
    new.depth:=parent_record.depth+1;
    if new.depth>2 then
      raise exception 'Se alcanzó el máximo de niveles de respuesta';
    end if;
  else
    new.depth:=0;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.author_id::text,0));
  select count(*) into recent_count from public.discussion_entries
  where author_id=new.author_id and created_at>now()-interval '60 seconds';
  if recent_count>0 then
    raise exception 'Espera un minuto antes de enviar otra participación';
  end if;
  select count(*) into recent_count from public.discussion_entries
  where author_id=new.author_id and created_at>now()-interval '24 hours';
  if recent_count>=12 then
    raise exception 'Se alcanzó el límite diario de participaciones';
  end if;

  new.created_at:=now();
  return new;
end;
$$;

drop policy if exists comments_author_submit on public.discussion_entries;
create policy comments_author_submit on public.discussion_entries
  for insert to authenticated
  with check ((select auth.uid())=author_id
    and status='approved' and consent_confirmed);

-- La política de lectura permanece exclusivamente para comentarios aprobados
-- (estado normal de publicación inmediata). Los moderadores podrán ocultarlos.
commit;