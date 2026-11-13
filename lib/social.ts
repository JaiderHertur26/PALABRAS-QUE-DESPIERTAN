/** Perfiles oficiales, verificados con las cuentas administradas del proyecto. */
export const socialAccounts = [
  {
    id: "facebook",
    nombre: "Facebook",
    usuario: "PalabrasQueDespiertan01",
    url: "https://www.facebook.com/PalabrasQueDespiertan01",
    descripcion: "Síguenos en Facebook para recibir reflexiones, artículos y novedades de la revista."
  },
  {
    id: "instagram",
    nombre: "Instagram",
    usuario: "@palabrasquedespiertan",
    url: "https://www.instagram.com/palabrasquedespiertan/",
    descripcion: "Encuentra nuestras tarjetas de reflexión, historias y artículos en Instagram."
  }
] as const;

export type SocialId = (typeof socialAccounts)[number]["id"];
