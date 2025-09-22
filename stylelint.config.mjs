/** @type {import('stylelint').Config} */
export default {
  extends: [
    "stylelint-config-recommended-scss",
    "stylelint-config-recess-order",
    "stylelint-prettier/recommended",
  ],
  files: ["src/**/*.scss"],
};
