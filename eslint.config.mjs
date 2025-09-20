import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base configurations
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended"
  ),
  
  // Global settings
  {
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
  },

  // Main configuration
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "unused-imports": (await import("eslint-plugin-unused-imports")).default,
      "simple-import-sort": (await import("eslint-plugin-simple-import-sort")).default,
    },
    rules: {
      // 🚀 TypeScript Rules
      "@typescript-eslint/no-unused-vars": "off", // Handled by unused-imports
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],

      // 🧹 Import/Export Rules - Clean Imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // React first
            ["^react", "^@?\\w"],
            // Internal packages
            ["^(@|components|utils|lib|hooks|types)(/.*|$)"],
            // Side effect imports
            ["^\\u0000"],
            // Parent imports
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Other relative imports
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Style imports
            ["^.+\\.?(css)$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "import/no-unresolved": "off", // TypeScript handles this

      // ⚡ Performance & Best Practices

      // 🎯 Code Quality Rules
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-sequences": "error",
      "no-throw-literal": "error",
      "no-unneeded-ternary": "error",
      "no-useless-call": "error",
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "prefer-template": "error",
      "prefer-spread": "error",
      "prefer-rest-params": "error",
      "prefer-arrow-callback": "error",
      "object-shorthand": "error",
      "no-duplicate-imports": "error",

      // 🔒 Security Rules
      "no-new-wrappers": "error",
      "no-constructor-return": "error",
      "no-promise-executor-return": "error",
      "no-async-promise-executor": "error",
      "require-atomic-updates": "error",

      // ⚛️ React Rules
      "react/react-in-jsx-scope": "off", // Next.js doesn't need this
      "react/prop-types": "off", // Using TypeScript
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // 🎨 Style Rules (handled by Prettier mostly)
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },

  // 🧪 Test file specific rules
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // 📁 Config file specific rules
  {
    files: ["*.config.{js,ts,mjs}", "*.setup.{js,ts}"],
    rules: {
      "import/no-default-export": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // 🚫 Ignore patterns
  {
    ignores: [
      ".next/**",
      "*.min.js",
      "build/**",
      "coverage/**",
      "dist/**",
      "node_modules/**",
      "out/**",
      "public/**",
      "src/components/ui/**",
    ],
  },
];

export default eslintConfig;
