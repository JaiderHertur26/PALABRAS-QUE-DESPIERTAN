-- PALABRAS QUE DESPIERTAN - corrección de seguridad verificable.
-- Aplicar ÚNICAMENTE al proyecto lwuzkjvolxwkxdyafcjv.
-- Una función preexistente en public tenía permisos de ejecución anónima.
-- Restringirla sin eliminarla ni alterar su definición.
begin;
do $secure$
begin
  if pg_catalog.to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$secure$;
commit;
