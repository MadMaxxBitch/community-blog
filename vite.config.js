import { defineConfig } from "vite";

export default defineConfig({
  base: "/community-blog/",
  esbuild: {
    jsx: "automatic"
  },
  test: {
    environment: "jsdom"
  }
});
