import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        // Node.js globals
        process: "readonly",
        Buffer: "readonly",
        // Web API globals
        Request: "readonly",
        Response: "readonly",
        URL: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        fetch: "readonly",
        // React globals
        React: "readonly",
        JSX: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off", // Allow console in development
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        Request: "readonly",
        Response: "readonly",
        URL: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        fetch: "readonly",
        React: "readonly",
        JSX: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-console": "off",
    },
  },
];