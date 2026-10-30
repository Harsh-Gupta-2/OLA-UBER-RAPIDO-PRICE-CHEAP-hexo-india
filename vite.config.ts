/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// GitHub Pages serves the site at /<REPO_NAME>/. Change REPO_NAME if you rename the repo.
const REPO_NAME = "OLA-UBER-RAPIDO-PRICE-CHEAP-hexo-india";

export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [react()],
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
