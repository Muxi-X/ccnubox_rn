// lint-staged.config.js
module.exports = {
  '**/*.{ts,tsx,js,jsx,mjs}': ['oxlint --fix', 'oxfmt'],
  '**/*.{json,jsonc,yml,yaml,md}': ['oxfmt'],
  '{app.json,android/**,ios/**}': [() => 'expo prebuild'],
};
