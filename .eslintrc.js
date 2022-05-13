module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {},
  globals: {
    strapi: "readonly",
    URL: "readonly",
    process: "readonly",
  },
};
