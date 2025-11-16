/* eslint-disable @typescript-eslint/no-require-imports */
const { defineConfig, globalIgnores } = require("eslint/config");
const nextVitals = require("eslint-config-next/core-web-vitals");
const nextTs = require("eslint-config-next/typescript");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    ignores: ["node_modules", ".next", "coverage", "public", "dist", "scripts"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {},
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // Flat config: provide per-glob config object instead of `overrides` key
  {
    files: ["__tests__/**", "app/api/**", "scripts/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
