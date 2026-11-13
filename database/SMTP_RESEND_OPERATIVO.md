# Envío de correos de acceso · Resend + Supabase

**Proyecto:** PALABRAS QUE DESPIERTAN
**Dominio propio:** https://www.palabrasquedespiertan.online
**Supabase:** `lwuzkjvolxwkxdyafcjv`
**Fecha de puesta en marcha:** 13 de noviembre de 2026

## Arquitectura operativa

- **Servicio:** Resend (integración nativa del Marketplace de Vercel; recurso administrado en el proyecto `palabras_que_despiertan`).
- **Cuenta y dominio:** Vercel administra el dominio `palabrasquedespiertan.online`; Resend indicó el estado `verified` para el mismo dominio.
- **Supabase Auth:** SMTP personalizado configurado; servidor `smtp.resend.com`, puerto `465`, usuario `resend`, remitente `no-reply@palabrasquedespiertan.online` y nombre `Palabras que despiertan`.
- **Claves:** Vercel contiene `RESEND_API_KEY` en el entorno de producción y Supabase guarda su propia copia en la configuración privada de Auth. No se guarda ninguna clave en GitHub.
- **Destinatario editorial:** `pquedespiertan@gmail.com` (correo de contacto y usuario moderador). El remitente `no-reply@...` es una identidad de envío; **no** representa un buzón para recibir respuestas.

## Verificación realizada

1. Instalación del recurso Resend en Vercel con plan gratuito.
2. Dominio `palabrasquedespiertan.online` verificado por Resend.
3. `supabase config push --project-ref lwuzkjvolxwkxdyafcjv` ejecutado sin revelar el secreto; Site URL de Auth apunta al dominio propio y se conservan las redirecciones a la URL `.vercel.app`.
4. Supabase aceptó un envío real a `pquedespiertan@gmail.com` y Resend lo registró como **delivered**.
5. Supabase aceptó también un envío a un alias de prueba del mismo Gmail, no perteneciente al equipo de Supabase; Resend lo registró como **delivered**. Se eliminó el usuario temporal creado para esa comprobación.
6. La base de datos contiene 19 conversaciones habilitadas con publicación directa para lectores con correo verificado y mecanismos de reporte y retirada.

## Política y mantenimiento

El plan gratuito de Resend establece 3.000 mensajes por mes y un máximo de 100 por día, según la documentación consultada el 13/11/2026. Supabase puede imponer límites de frecuencia adicionales. No sustituir la verificación del correo por un acceso anónimo.

Para revisar el proveedor, abrir los recursos de Resend en la integración de Vercel, comprobar el estado del dominio y los mensajes entregados. No imprimir las claves en registros ni pasar `RESEND_API_KEY` a variables con prefijo `NEXT_PUBLIC_`.

La cuenta administradora `pquedespiertan@gmail.com` debe abrir su enlace de acceso para activar una sesión real; nunca se debe marcar manualmente como verificada sin comprobar la propiedad de la dirección.

**Si cambia el dominio**, actualizar las redirecciones de Supabase Auth, el dominio remitente de Resend, las variables de Vercel y el sitemap/canonicals de la revista antes de desplegar.
