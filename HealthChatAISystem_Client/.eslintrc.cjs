module.exports = {
  env: {
    es6: true,
    browser: true,
    es2021: true,
  },
  extends: ["airbnb", "prettier"],
  plugins: ["prettier"],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  rules: {
    "prettier/prettier": "error",
    "jsx-a11y/label-has-associated-control": "off",
    "react/prop-types": "off",
    "import/prefer-default-export": "off",
    "no-alert": "off",
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
};
