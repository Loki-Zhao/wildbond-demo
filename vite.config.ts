import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const githubPagesBase = process.env.GITHUB_PAGES === "true" ? "/wildbond-demo/" : "/";

export default defineConfig({
  base: githubPagesBase,
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    allowedHosts: ["healthcare-actively-platforms-ranger.trycloudflare.com", "pool-plants-machinery-manitoba.trycloudflare.com"]
  }
});
