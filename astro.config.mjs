// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://nicholasmkasten.com",
  output: "static",
  adapter: vercel(),
  integrations: [mdx()],
  vite: {
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
