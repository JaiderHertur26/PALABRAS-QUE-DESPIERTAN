-- GENERADO AUTOMÁTICAMENTE. Revise antes de ejecutar en Supabase DEDICADO.
-- Sólo habilita hilos para mensajes publicados, artículos autorizados y temas aprobados.
begin;
update public.discussion_subjects set enabled=false;
insert into public.discussion_subjects(kind,subject_id,title,enabled) values
 ('mensaje', 'pd-001-dios-ya-lo-sabe', 'Dios ya lo sabe', true),
 ('tema', 'orar-cuando-cuesta', 'Orar cuando cuesta', true),
 ('tema', 'confiar-en-la-sequia', 'Confiar en medio de la sequía', true),
 ('tema', 'perdon-y-camino', 'El perdón como camino', true),
 ('tema', 'esperanza-ante-la-perdida', 'Esperanza ante la pérdida', true),
 ('tema', 'dios-en-lo-cotidiano', 'Dios en la vida cotidiana', true),
 ('tema', 'servir-al-projimo', 'Servir al prójimo', true),
 ('articulo', 'art-001-todo-fue-creado-por-el-y-para-el', 'Todo fue creado por Él y para Él', true),
 ('articulo', 'art-002-imagen-y-semejanza', 'Imagen y semejanza', true),
 ('articulo', 'art-003-del-eden-al-calvario', 'Del Edén al Calvario', true),
 ('articulo', 'art-004-el-arbol-de-la-vida', 'El árbol de la vida', true),
 ('articulo', 'art-005-la-sangre-el-madero-y-la-vida', 'La sangre, el madero y la vida', true),
 ('articulo', 'art-006-el-amor-que-nos-introduce-en-dios', 'El amor que nos introduce en Dios', true),
 ('articulo', 'art-007-hijos-en-el-hijo', 'Hijos en el Hijo', true),
 ('articulo', 'art-008-del-primer-aliento-al-espiritu-de-la-nueva-creacion', 'Del primer aliento al Espíritu de la nueva creación', true),
 ('articulo', 'art-009-la-confianza-como-reconocimiento-del-origen-y-del-destino-del-hombre', 'La confianza como reconocimiento del origen y del destino del hombre', true),
 ('articulo', 'art-010-orar-no-para-informar-a-dios-sino-para-abrir-el-corazon-a-su-presencia', 'Orar no para informar a Dios, sino para abrir el corazón a su presencia', true)
on conflict(kind,subject_id) do update set title=excluded.title, enabled=excluded.enabled;
commit;
