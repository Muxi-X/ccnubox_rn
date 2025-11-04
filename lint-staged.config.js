// lint-staged.config.js
module.exports = {
  '**/*.{ts,tsx,js,jsx,mjs}': ['expo lint', 'prettier --write'],
  '{app.json,android/**,ios/**}': [() => 'expo prebuild'],
};
