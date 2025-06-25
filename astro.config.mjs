// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Musafir Documentation",
      description:
        "Welcome to the Musafir app documentation. This documentation contains explanations of the main components of the application.",
      social: {
        github: "https://github.com/sayagaffy/musafir",
      },
      sidebar: [
        {
          label: "🏗️ Foundation",
          items: [
            "foundation/project-overview",
            "foundation/development-setup",
          ],
        },
        {
          label: "🔐 Authentication & Navigation",
          items: [
            "authentication/authentication-system",
            "authentication/main-navigation",
          ],
        },
        {
          label: "📚 Dokumentasi Musafir",
          autogenerate: { directory: "dokumentasi musafir" },
        },
        {
          label: "Pages",
          autogenerate: { directory: "pages" },
        },
      ],
    }),
  ],
});
