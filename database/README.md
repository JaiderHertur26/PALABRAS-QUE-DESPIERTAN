# Activación de la comunidad de PALABRAS QUE DESPIERTAN

**Estado:** URL exclusiva recibida y validada; todavía faltan credenciales, instalación del SQL, pruebas de permisos y moderación. **NO ABIERTA AL PÚBLICO.**

Este módulo pertenece exclusivamente a la revista PALABRAS QUE DESPIERTAN. Nunca usar las bases de datos de Contabilidad HERTUR ni de Registro Sacramental.

## Arquitectura

- **Supabase Auth:** enlace temporal de acceso por correo; el lector no administra contraseña.
- **PostgreSQL con RLS:** lectura pública solo de participaciones aprobadas; alta únicamente por usuario autenticado.
- **Moderación previa:** todo comentario o testimonio entra en estado `pending`; ningún envío se hace público por defecto.
- **Conversaciones:** relaciones por `subject_type` y `subject_id` para mensajes, artículos y temas.
- **Respuestas:** hasta tres niveles de lectura (principal + respuesta + respuesta a respuesta); todas pendientes de aprobación.
- **Reportes:** envío autenticado con motivo, control de duplicados y revisión editorial.
- **Auditoría:** cambios de estado registrados con moderador, fecha y justificación.
- **Datos públicos:** nombre elegido, texto, fecha y jerarquía. El correo y la identidad técnica no aparecen en la consulta pública.

## Temas habilitables

Se generan automáticamente desde `data/testimony-topics.json`: seis temas de orientación católica y referencias bíblicas contextualizadas.

Las publicaciones elegibles se toman de `data/site-content.json` (solo mensajes publicados) y `data/public-articles.json` junto con `data/article-publication-allowlist.json` (solo artículos aprobados y autorizados). Actualmente la semilla genera 1 mensaje, 10 artículos y 6 temas.

## Activación — orden obligatorio

1. **Proyecto Supabase comunicado por el autor:** `lwuzkjvolxwkxdyafcjv` (`https://lwuzkjvolxwkxdyafcjv.supabase.co`). Verificar que la cuenta conectada tenga permisos sobre él. No crear otro ni reutilizar bases ajenas. No reutilizar otros proyectos del usuario.
2. Validar y aprobar la **política de privacidad** aplicable en Colombia, su responsable, canal de contacto y procedimientos de consulta, eliminación y conservación de datos; no habilitar captación de testimonios antes de esto.
3. Configurar autenticación por correo en Supabase, el remitente de mensajes de acceso y los dominios autorizados. Para pruebas, agregar `http://localhost:3192/auth/callback`; para el despliegue final, registrar la URL real de `/auth/callback` sin comodines indiscriminados.
4. Revisar y ejecutar **`database/schema.sql`** en el SQL Editor del proyecto dedicado. Este archivo crea tablas, índices, funciones de validación, triggers, RLS y permisos por columnas.
5. Ejecutar `npm run community:seed` para generar **`database/community-seed.sql`**, revisar que solo incluya material aprobado y aplicar su SQL en el proyecto. No usar una semilla vieja después de publicar un nuevo mensaje o artículo.
6. Configurar **`NEXT_PUBLIC_SUPABASE_URL`**, **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** y **`SUPABASE_SECRET_KEY`** en el entorno del proyecto. La tercera clave es *solo del servidor*: jamás compartirla, subirla a Git ni anteponerle NEXT_PUBLIC.
7. Crear la cuenta del primer moderador mediante el enlace de correo. Verificar su UUID en el panel Auth; conceder su función con una inserción revisada en `public.discussion_moderators`. No basar permisos en nombres, correos entregados por el navegador ni `user_metadata`.
8. Ejecutar las herramientas de Supabase para comprobar RLS y avisos de seguridad (`get_advisors`). Probar usuarios sin sesión, lectores autenticados, autores maliciosos que intenten cambiar estado, respuestas cruzadas, controles de frecuencia y acceso del moderador.
9. Revisar reportes, bloqueo de comentarios abusivos y un procedimiento de eliminación de datos personales.
10. Activar primero una **vista previa real y protegida**, verificando que Vercel no la clasifique como producción, pues ocurrió anteriormente. Solo después de aprobar la experiencia y la legalidad habilitar la participación pública.

## Seguridad ampliada (13/11/2026)

El esquema actualizado incluye bloqueo transaccional por autor para que múltiples solicitudes simultáneas no evadan los límites de envío. Un trigger atómico comprueba la cuenta del moderador, protege los campos originales y registra la decisión de aprobar, rechazar u ocultar. Ocultar un comentario oculta también las respuestas aprobadas anidadas, dejando todas las actuaciones auditadas.

La URL está fijada en `lib/supabase/config.ts`: el código solo admite la referencia Supabase `lwuzkjvolxwkxdyafcjv`; exige claves modernas `sb_publishable_` en navegador y `sb_secret_` exclusivamente en servidor. La función de participación permanece bloqueada por la bandera `NEXT_PUBLIC_COMUNIDAD_ACTIVA=false`, incluso si alguien configura claves antes de aprobar privacidad y seguridad. Cambiarla a `true` únicamente durante pruebas protegidas o después del visto bueno para producción. Nunca usar una clave de una base diferente.

**Al recuperar acceso por ChatGPT:** volver a leer el `schema.sql` actual antes de aplicar; no utilizar copias anteriores a este refuerzo. Instalar el esquema y la semilla solo en el proyecto referenciado; pasar revisiones de advisors y probar la jerarquía de respuestas antes de la activación.

## Controles técnicos

La base limita cada usuario a una participación por minuto y doce participaciones por día. Los reportes se limitan a uno por minuto y veinte por día. Solo se puede responder a una publicación aprobada, dentro del mismo artículo, mensaje o tema. La jerarquía admite profundidad máxima 2 (raíz, respuesta, respuesta a la respuesta).

`public.discussion_entries`, `public.discussion_reports`, `public.discussion_moderators` y `public.discussion_audit` tienen RLS habilitado. La lectura pública recibe columnas restringidas y únicamente estado `approved`. Las claves privadas y las decisiones editoriales usan rutas de servidor, no código del navegador.

El moderador accede a **`/moderacion`** solo si la cuenta verificada pertenece a la tabla de moderadores. Puede aprobar/rechazar pendientes, resolver reportes y ocultar contenido visible.

## Estado actual: límite conocido

El autor ya suministró la URL del proyecto independiente `lwuzkjvolxwkxdyafcjv`. La integración de Supabase disponible en ChatGPT todavía no dispone de permiso sobre ese proyecto (el listado actual solo muestra las dos bases de otros sistemas). **El esquema ya fue instalado en ese proyecto**. La interfaz sigue desactivada hasta obtener acceso, aplicar el esquema, verificar RLS y registrar al primer moderador. No se han guardado testimonios ni comentarios reales.

**No configurar una clave de un proyecto ajeno para hacer funcionar la interfaz rápidamente.**

## ACTUALIZACIÓN CONFIRMADA · INSTALACIÓN EN SUPABASE · 13/11/2026

La información de «preparación» anterior queda actualizada por los siguientes hechos comprobados:

- **Conexión por CLI operativa**: proyecto `lwuzkjvolxwkxdyafcjv` enlazado desde la carpeta correcta de la web, con consulta SQL real exitosa mediante `supabase db query --linked --project-ref`.
- **Base instalada:** cinco tablas de comunidad; las cinco con RLS activo; cuatro políticas, cuatro funciones y cuatro triggers; las tablas inicialmente vacías.
- **Semilla de conversaciones instalada:** 18 temas (1 PD, 11 ART y 6 temas de testimonios), todos con `enabled=false`; los lectores no pueden participar aún.
- **Verificación real:** 0 comentarios, 0 moderadores, acceso público a reportes y auditoría bloqueado, no se permiten envíos anónimos.
- **Seguridad:** se detectó una función preexistente `public.rls_auto_enable()` ejecutable por usuarios anónimos; se revocó su acceso público sin eliminar la función. `supabase db advisors --type security --level warn`: **No issues found**.
- **Claves:** clave `sb_publishable_` y clave de servidor `sb_secret_` del proyecto correcto configuradas en `.env.local`, excluido de GitHub. **No se imprimieron ni publicaron.**
- **Cierre editorial:** `NEXT_PUBLIC_COMUNIDAD_ACTIVA=false` en el entorno local; el generador de hilos produce `enabled=false` por defecto. La apertura requiere autorización expresa, correo de moderador y política de privacidad aprobada.
- **Precaución:** CMD necesita `cd /d "D:\01 PALABRAS QUE DESPIERTAN\PÁGINA WEB"` para cambiar de unidad. El enlace ejecutado inicialmente desde C: quedó en el perfil del usuario; utilizar siempre la carpeta correcta de la web.

Los cambios de ART-011 aparecieron simultáneamente en otra tarea editorial. La base real usa 11 artículos aprobados. Para el commit actual de preparación, el archivo de semilla en Git se mantiene coherente con los 10 artículos de la rama base (17 hilos, cerrados); al integrar el siguiente artículo, regenerar la semilla desde el catálogo oficial y revisarla antes de aplicar cambios.

## 0.4.0 · Publicación directa, comunicación y seguridad

**Correo editorial principal:** pquedespiertan@gmail.com. El proyecto Supabase conectado es exclusivamente `lwuzkjvolxwkxdyafcjv`.

La base de datos instaló `database/community-live-publishing.sql`. Los comentarios y respuestas de lectores con correo confirmado y consentimiento se publican al enviarse (estado `approved`), sin espera de aprobación editorial. Los límites, la protección contra enlaces y correos ajenos, el bloqueo de respuestas cruzadas, la auditoría y la retirada por moderador se validaron mediante 17 pruebas contra la base real. Tras la prueba, los usuarios de test, mensajes y reportes fueron eliminados.

La cuenta `pquedespiertan@gmail.com` está creada con permiso de moderador principal **pero no se ha comprobado todavía su acceso por correo**. Se requiere que el propietario abra un enlace de inicio de sesión; no se marcará la dirección como confirmada artificialmente.

**Límite de servicio externo**: Supabase restringe su emisor SMTP predeterminado a correos de miembros del equipo y 2 mensajes/hora. Para que cualquier lector pueda iniciar sesión con enlace necesita un SMTP transaccional configurado (Resend, SendGrid, Brevo u otro proveedor). No se desactiva la confirmación de correo como atajo inseguro. Hasta completar ese envío y probar un lector externo, `NEXT_PUBLIC_COMUNIDAD_ACTIVA=false` mantiene la recepción de comentarios cerrada en producción, aunque el código y la base ya están listos. El despliegue de la revista puede publicar la lectura sin habilitar participaciones.

La política de privacidad, aviso legal y contacto ya identifican el canal `pquedespiertan@gmail.com`. Se recomienda revisión jurídica propia antes de recoger datos de terceros.

Toda configuración OAuth, SMTP y credenciales queda excluida del repositorio. El proyecto permite actualizar automáticamente los hilos solo de mensajes y artículos autorizados mediante lista blanca, sin activar manuscritos inéditos.
