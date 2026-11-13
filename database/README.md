# Activación de la comunidad de PALABRAS QUE DESPIERTAN

**Estado:** funcionalidad programada y pruebas locales superadas. **NO CONECTADA NI ABIERTA AL PÚBLICO.**

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

1. **Elegir una organización Supabase** y crear un **proyecto exclusivamente dedicado** a PALABRAS QUE DESPIERTAN. Verificar su posible costo antes de crearlo. No reutilizar otros proyectos del usuario.
2. Validar y aprobar la **política de privacidad** aplicable en Colombia, su responsable, canal de contacto y procedimientos de consulta, eliminación y conservación de datos; no habilitar captación de testimonios antes de esto.
3. Configurar autenticación por correo en Supabase, el remitente de mensajes de acceso y los dominios autorizados. Para pruebas, agregar `http://localhost:3192/auth/callback`; para el despliegue final, registrar la URL real de `/auth/callback` sin comodines indiscriminados.
4. Revisar y ejecutar **`database/schema.sql`** en el SQL Editor del proyecto dedicado. Este archivo crea tablas, índices, funciones de validación, triggers, RLS y permisos por columnas.
5. Ejecutar `npm run community:seed` para generar **`database/community-seed.sql`**, revisar que solo incluya material aprobado y aplicar su SQL en el proyecto. No usar una semilla vieja después de publicar un nuevo mensaje o artículo.
6. Configurar **`NEXT_PUBLIC_SUPABASE_URL`**, **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** y **`SUPABASE_SECRET_KEY`** en el entorno del proyecto. La tercera clave es *solo del servidor*: jamás compartirla, subirla a Git ni anteponerle NEXT_PUBLIC.
7. Crear la cuenta del primer moderador mediante el enlace de correo. Verificar su UUID en el panel Auth; conceder su función con una inserción revisada en `public.discussion_moderators`. No basar permisos en nombres, correos entregados por el navegador ni `user_metadata`.
8. Ejecutar las herramientas de Supabase para comprobar RLS y avisos de seguridad (`get_advisors`). Probar usuarios sin sesión, lectores autenticados, autores maliciosos que intenten cambiar estado, respuestas cruzadas, controles de frecuencia y acceso del moderador.
9. Revisar reportes, bloqueo de comentarios abusivos y un procedimiento de eliminación de datos personales.
10. Activar primero una **vista previa real y protegida**, verificando que Vercel no la clasifique como producción, pues ocurrió anteriormente. Solo después de aprobar la experiencia y la legalidad habilitar la participación pública.

## Controles técnicos

La base limita cada usuario a una participación por minuto y doce participaciones por día. Los reportes se limitan a uno por minuto y veinte por día. Solo se puede responder a una publicación aprobada, dentro del mismo artículo, mensaje o tema. La jerarquía admite profundidad máxima 2 (raíz, respuesta, respuesta a la respuesta).

`public.discussion_entries`, `public.discussion_reports`, `public.discussion_moderators` y `public.discussion_audit` tienen RLS habilitado. La lectura pública recibe columnas restringidas y únicamente estado `approved`. Las claves privadas y las decisiones editoriales usan rutas de servidor, no código del navegador.

El moderador accede a **`/moderacion`** solo si la cuenta verificada pertenece a la tabla de moderadores. Puede aprobar/rechazar pendientes, resolver reportes y ocultar contenido visible.

## Estado actual: límite conocido

No existe todavía una base de datos Supabase independiente para la revista. La interfaz de comentarios está **construida pero desactivada**, con un mensaje claro para los lectores. No se han guardado testimonios ni comentarios reales.

**No configurar una clave de un proyecto ajeno para hacer funcionar la interfaz rápidamente.**
