// lint-staged.config.js
module.exports = {
  '**/*.{ts,tsx,js,jsx,mjs}': ['oxlint --fix', 'oxfmt'],
  '{app.json,android/**,ios/**}': [() => 'expo prebuild'],
};
