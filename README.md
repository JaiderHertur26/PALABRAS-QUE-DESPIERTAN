# PALABRAS QUE DESPIERTAN · Web editorial

Sitio oficial de reflexión católica del **P. Jaider Herrera Turizo**. Versión técnica **0.2.0**, desarrollada con Next.js 16, TypeScript y React 19. El diseño está basado en la maqueta aprobada y en los dos originales gráficos oficiales.

## Estado de publicación

**EN DESARROLLO · SIN APROBACIÓN DE LANZAMIENTO PÚBLICO.**

El repositorio es [JaiderHertur26/PALABRAS-QUE-DESPIERTAN](https://github.com/JaiderHertur26/PALABRAS-QUE-DESPIERTAN), conectado al proyecto Vercel `jaiderherreras-projects/palabras_que_despiertan`.

Para evitar despliegues involuntarios, `vercel.json` mantiene **deshabilitados todos los despliegues Git automáticos** hasta autorización expresa. La promoción a producción deberá hacerse tras pruebas, aprobación editorial y revisión de privacidad.

## Cómo trabajar en el equipo editorial

```powershell
cd 'D:\01 PALABRAS QUE DESPIERTAN\PÁGINA WEB'
npm ci
npm run check:editorial
npm test
npm run dev
```

Abrir `http://localhost:3000`. Para verificar una entrega completa: `npm run verify`. Para probar rutas tras compilar: ejecutar `npm run start -- -p 3190` y luego `npm run smoke` (se puede cambiar el puerto con `WEB_BASE_URL`).

## Estructura funcional

- **Inicio**: portada oficial, mensaje destacado auténtico, acceso a series, temporadas, biblioteca teológica y autor.
- **Mensajes**: búsqueda sin sensibilidad a tildes, filtros por serie/temporada, orden y tarjetas oficiales.
- **Detalle PD-###**: lectura textual accesible, cita, firma, fecha verificada, herramientas para copiar/compartir, navegación y contexto temático.
- **Series**: directorio de 36 series con página propia para cada una.
- **Temporadas**: las 12 temporadas del plan maestro con página individual, tres series y publicaciones disponibles.
- **Teología**: presentación del área sin filtrar ni exponer manuscritos internos.
- **Autor, redes, contacto, privacidad y aviso legal**: contenido prudente, sin biografía inventada, formularios falsos ni vínculos no verificados.
- **Accesibilidad**: navegación móvil, foco visible, saltar al contenido, HTML seleccionable, imágenes con textos alternativos, controles etiquetados y preferencias de movimiento reducido.

## Contrato editorial obligatorio

`MENSAJES` y `ARTÍCULOS` son las fuentes maestras **de solo lectura**. Ningún archivo original se modifica desde el sitio web.

El comando `npm run sync:editorial` consulta:
1. `MENSAJES/PLAN MAESTRO - 12 TEMPORADAS.md`.
2. `MENSAJES/CATALOGO_GENERAL_MENSAJES.csv`.
3. Las fichas individuales de PD-###.
4. `data/publication-allowlist.json`, lista blanca controlada por el editor.

Para que una pieza sea pública deben coincidir **autorización expresa de la lista blanca, estado PUBLICADO, aprobación editorial, fecha real no futura, texto aprobado y SHA256 de su tarjeta gráfica**.

Un elemento programado nunca equivale a publicado. El importador no copia contenidos de `ARTÍCULOS`. La lista blanca de esta primera versión contiene únicamente **PD-001**. No sincronizar automáticamente en Vercel ni publicar nuevas piezas por el mero transcurso de una fecha.

El archivo generado `data/site-content.json` es una instantánea pública versionada; el build remoto no necesita acceso al equipo editorial.

## Integridad de la identidad visual

Los únicos originales permanentes son:
- `FONDO_OFICIAL_CRUZ_DORADA.png` (cruz dorada).
- `PORTADA_OFICIAL_PALABRAS_QUE_DESPIERTAN.png` (brote iluminado).

Ambos mantienen sus SHA256 oficiales. La tarjeta PD-001 es un contenido editorial, no un tercer original de identidad. Los iconos PNG del sitio son **recortes técnicos** del fondo oficial, no nuevos originales.

## Calidad y seguridad

`npm run verify` ejecuta control de integridad, pruebas unitarias y compilación. `npm run smoke` comprueba HTTP, políticas de indexación, cabeceras, páginas y bloqueo de una tarjeta programada. El workflow `.github/workflows/quality.yml` ejecuta CI sin acceso a secretos ni carpetas privadas.

- `.env*`, `.vercel/`, originales editoriales externos, documentos de continuidad, capturas, maqueta y notas locales quedan excluidos del repositorio.
- `robots.txt` y las metatags de todas las páginas bloquean la indexación hasta el lanzamiento autorizado.
- No se ha conectado formulario de contacto, servicio de analítica o backend de edición no verificado.
- Cabeceras de seguridad para contenido, marcos y permisos del navegador definidas en `next.config.ts`.

## Próximos requisitos de lanzamiento

Validación final de diseño en teléfono real; autorización de textos legales y canal de contacto; comprobación de redes oficiales; elección de dominio; revisión SEO para habilitar indexación solo al publicarse; definir rama `main` de producción; decidir y autorizar integración del Centro Editorial.

**No publicar automáticamente las piezas programadas ni promocionar una compilación sin consentimiento editorial.**


## Revista y comunidad 0.3 (13/11/2026)

El sitio incluye revista de investigación teológica, diez artículos originales autorizados, seis temas de testimonios y módulos de comentarios para mensajes, artículos y debates temáticos.

**Participación aún no activa:** se necesita un proyecto Supabase específico para esta revista, autenticación por correo, cuenta moderadora y política de privacidad definitiva. Nunca utilizar bases de otros proyectos.

- `npm run check:articles`: revisión de los ART autorizados.
- `npm run community:seed`: genera SQL de hilos habilitables solo de piezas publicadas y temas aprobados.
- `database/schema.sql` y `database/community-seed.sql`: preparar únicamente en Supabase dedicado.
- `database/README.md`: despliegue, RLS, privacidad, moderación, reportes y procedimiento de seguridad.
- `/revista`, `/articulos`, `/testimonios`, `/participar`: secciones públicas de lectura.
- `/moderacion`: acceso restringido a la cuenta editorial previamente autorizada.
- `npm run verify` y `npm run smoke`: pruebas y compilación.

**Estado editorial:** el contenido publicado de mensajes y artículos se controla mediante listas blancas independientes; un manuscrito que no haya sido autorizado no se muestra. Las imágenes originales se mantienen inalteradas. No se activó ningún despliegue de producción en esta entrega.


## Supabase recibido — preparación segura 0.3.1

**Proyecto indicado:** `https://lwuzkjvolxwkxdyafcjv.supabase.co` (referencia pública `lwuzkjvolxwkxdyafcjv`).

El acceso de Supabase conectado a ChatGPT no tiene todavía permisos sobre este proyecto; por tanto **ninguna tabla ni política fue instalada**. La configuración de la URL local se encuentra en `.env.local`, excluido de Git; no se añadió ninguna clave. La comunidad permanece cerrada por la bandera `NEXT_PUBLIC_COMUNIDAD_ACTIVA=false` hasta autorizar una activación expresa después de pruebas y política de privacidad.

El esquema `database/schema.sql` incluye control de identidad, RLS, límites de frecuencia, moderación previa, auditoría atómica de cambios y ocultación en cascada de respuestas. El script `npm run community:seed` debe ejecutarse después de cada incorporación de mensajes o artículos autorizados para actualizar únicamente los hilos permitidos. Instrucciones completas en `database/README.md`.

**No compartir claves `sb_secret_` en el chat ni guardarlas en el repositorio.** Para terminar la conexión, autorizar el proyecto nuevo en el plugin Supabase conectado a ChatGPT o configurar las credenciales directamente y con seguridad en el entorno del sitio.

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
