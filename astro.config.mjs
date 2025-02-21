// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Musafir Docs",
      description: "Dokumentasi Musafir",
      social: {
        github: "https://github.com/sayagaffy",
      },
      sidebar: [
        {
          label: "Musafir Docs",
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
