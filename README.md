# PALABRAS QUE DESPIERTAN — Página web

Sitio editorial católico de **P. Jaider Herrera Turizo**, desarrollado con Next.js 16, React y TypeScript.

## Estado

Primera versión funcional en desarrollo. La versión pública final requiere revisión gráfica, editorial y de privacidad. No se debe interpretar la existencia de código, ramas o vistas previas como autorización de lanzamiento público.

- [Repositorio GitHub](https://github.com/JaiderHertur26/PALABRAS-QUE-DESPIERTAN)
- Proyecto Vercel: `jaiderherreras-projects/palabras_que_despiertan`
- Rama de producción prevista: `main`
- La web utiliza exclusivamente mensajes confirmados como publicados. Actualmente se incluye PD-001.
- Los artículos de investigación internos no se publican.

## Desarrollo local

```powershell
npm ci
npm run check:editorial
npm run dev
```

Abrir `http://localhost:3000`. Para verificar compilación: `npm run build`.

## Sincronización editorial segura

En el ordenador editorial se dispone de las carpetas hermanas `MENSAJES` y `ARTÍCULOS`. El comando `npm run sync:editorial` lee el plan maestro y el catálogo oficial de mensajes y produce una **instantánea pública de solo lectura** en `data/site-content.json`.

**No ejecutar sincronización en Vercel:** el despliegue utiliza la instantánea previamente verificada y versionada. El importador rechaza nuevos mensajes publicados hasta comprobar y actualizar expresamente su ficha y huella de imagen. Nunca sustituye la aprobación humana ni modifica los archivos editoriales fuente.

## Identidad visual

Se respetan los dos originales gráficos oficiales: cruz dorada y portada con brote iluminado. La primera tarjeta PD-001 es contenido editorial y no un tercer original de identidad. Sus copias públicas se comprueban por SHA-256.

## Seguridad de archivos

No incorporar al repositorio archivos `.env*`, `.vercel/`, documentación interna, credenciales, capturas privadas ni manuscritos. El código debe mantener el diseño accesible, los borradores fuera del acceso público y el control de publicación protegido.

La preparación del proyecto y las vistas previas no deben activar la publicación de producción sin validación editorial final.
