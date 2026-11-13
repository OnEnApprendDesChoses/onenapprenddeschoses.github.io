import { defineConfig } from "astro/config";

export default defineConfig({
  // Site d'utilisateur GitHub Pages : URL à la racine.
  // Si tu déplaces le blog sur un repo projet ou un domaine, change cette ligne.
  site: "https://onenapprenddeschoses.github.io",
  i18n: {
    defaultLocale: "fr",
    locales: ["fr", "en"],
  },
});
