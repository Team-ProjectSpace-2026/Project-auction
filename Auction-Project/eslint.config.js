import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";

// Flat ESLint configuration for the Auction‑Project frontend.
export default defineConfig([
  // Ignore build output directories.
  globalIgnores(["dist"]),

  // Base configuration applied to all JavaScript/JSX files.
  {
    files: ["**/*.{js,jsx}"],
    plugins: { react },
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {}, // No custom top‑level rules needed.
  },

  // Disable the react‑refresh rule for files that only export contexts.
  {
    files: ["src/context/**/*.jsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
]);
