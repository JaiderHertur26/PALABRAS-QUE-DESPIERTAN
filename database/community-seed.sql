-- GENERADO AUTOMÁTICAMENTE. Revise antes de ejecutar en Supabase DEDICADO.
-- Sólo registra hilos para publicaciones aprobadas y temas propuestos.
-- Estado habilitado: NO, protección previa al lanzamiento
begin;
update public.discussion_subjects set enabled=false;
insert into public.discussion_subjects(kind,subject_id,title,enabled) values
 ('mensaje', 'pd-001-dios-ya-lo-sabe', 'Dios ya lo sabe', false),
 ('tema', 'orar-cuando-cuesta', 'Orar cuando cuesta', false),
 ('tema', 'confiar-en-la-sequia', 'Confiar en medio de la sequía', false),
 ('tema', 'perdon-y-camino', 'El perdón como camino', false),
 ('tema', 'esperanza-ante-la-perdida', 'Esperanza ante la pérdida', false),
 ('tema', 'dios-en-lo-cotidiano', 'Dios en la vida cotidiana', false),
 ('tema', 'servir-al-projimo', 'Servir al prójimo', false),
 ('articulo', 'art-001-todo-fue-creado-por-el-y-para-el', 'Todo fue creado por Él y para Él', false),
 ('articulo', 'art-002-imagen-y-semejanza', 'Imagen y semejanza', false),
 ('articulo', 'art-003-del-eden-al-calvario', 'Del Edén al Calvario', false),
 ('articulo', 'art-004-el-arbol-de-la-vida', 'El árbol de la vida', false),
 ('articulo', 'art-005-la-sangre-el-madero-y-la-vida', 'La sangre, el madero y la vida', false),
 ('articulo', 'art-006-el-amor-que-nos-introduce-en-dios', 'El amor que nos introduce en Dios', false),
 ('articulo', 'art-007-hijos-en-el-hijo', 'Hijos en el Hijo', false),
 ('articulo', 'art-008-del-primer-aliento-al-espiritu-de-la-nueva-creacion', 'Del primer aliento al Espíritu de la nueva creación', false),
 ('articulo', 'art-009-la-confianza-como-reconocimiento-del-origen-y-del-destino-del-hombre', 'La confianza como reconocimiento del origen y del destino del hombre', false),
 ('articulo', 'art-010-orar-no-para-informar-a-dios-sino-para-abrir-el-corazon-a-su-presencia', 'Orar no para informar a Dios, sino para abrir el corazón a su presencia', false)
on conflict(kind,subject_id) do update set title=excluded.title, enabled=excluded.enabled;
commit;
