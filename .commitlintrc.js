module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type
    'type-enum': [
      2,
      'always',
      [
        'init',
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert',
        'build',
        'ci',
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // Scope
    'scope-case': [0],
    'scope-empty': [2, 'never'],

    // Subject
    'subject-case': [2, 'never', ['start-case', 'pascal-case']],
    'header-max-length': [2, 'always', 74],

    // Body & Footer
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [1, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [1, 'always', 20],
  },
};
