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
