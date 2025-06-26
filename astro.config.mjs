// astro.config.mjs
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Musafir Documentation",
      description:
        "Complete developer documentation for Musafir - Muslim Travel Companion App built with Flutter, Firebase, and Google Places API.",
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
          label: "🏠 Core Features",
          items: ["core-features/home-module", "core-features/explore-module"],
        },
        {
          label: "🛠️ Advanced Features",
          items: [
            "advanced-features/account-favorites-management",
            "advanced-features/data-management",
          ],
        },
        {
          label: "⚡ Technical Deep Dive",
          badge: "New",
          items: [
            "deployment/testing-strategies",
            "deployment/build-release",
            "deployment/monitoring",
            "guides/code-quality",
          ],
        },
        {
          label: "📡 API Documentation",
          badge: "Complete",
          items: ["apis/api-documentation"],
        },
        {
          label: "📚 Integration Guides",
          items: ["guides/integration"],
        },
        {
          label: "📖 Legacy Documentation",
          badge: "Archive",
          collapsed: true,
          items: [
            {
              label: "🎮 Controllers Deep Dive",
              collapsed: true,
              items: [
                "dokumentasi-musafir/controller/home-controller-deep-dive",
                "dokumentasi-musafir/controller/musafir-controller-docs",
                "dokumentasi-musafir/controller/musafir-home-controller-docs",
              ],
            },
            {
              label: "📱 Pages & UI Components",
              collapsed: true,
              items: [
                "dokumentasi-musafir/pages/home/add-place-deep-dive",
                "dokumentasi-musafir/pages/favorite/favorite-page-deep-dive",
                "dokumentasi-musafir/pages/explore-page/explore-docs-pages",
                "dokumentasi-musafir/pages/login-page/auth-documentation-signinoutpasswordpage-deep-dive",
              ],
            },
            {
              label: "🗃️ Data & API Layer",
              collapsed: true,
              items: [
                "dokumentasi-musafir/api-and-repositories/musafir-repository-deep-dive-analysis",
                "dokumentasi-musafir/api-and-repositories/musafir-repository-docs",
                "dokumentasi-musafir/firestore/musafir-firestore-documentation-deep-dive",
              ],
            },
            {
              label: "🎨 Theme & Routing",
              collapsed: true,
              items: ["dokumentasi-musafir/routes/musafir-theme-documentation"],
            },
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
