import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {files: ["**/*.{js,mjs,cjs,vue}"]},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    ignores: ['node_modules', 'dist', 'public', '.nuxt'],
  },
  eslintConfigPrettier,
  {
    // Override configuration for vue files in the pages directory
    files: ["pages/**/*.vue", "layouts/**/*.vue"],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
];