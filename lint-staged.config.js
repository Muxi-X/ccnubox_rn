// lint-staged.config.js
module.exports = {
  '**/*.{ts,tsx,js,jsx,mjs}': [
    'oxlint --fix',
    'oxfmt --no-error-on-unmatched-pattern',
  ],
  '**/*.{json,jsonc,yml,yaml,md}': ['oxfmt --no-error-on-unmatched-pattern'],
  '{app.json,android/**,ios/**}': [() => 'expo prebuild'],
};
