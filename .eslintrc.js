// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier', 'import'],
  rules: {
    'prettier/prettier': 'error',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    // 禁止重复引入模块
    'no-duplicate-imports': 'error',
    // 确保所有的导入都出现在文件的顶部
    'import/first': 'error',
    // 禁止在同一个文件中使用多行导入同一个模块
    'import/no-duplicates': 'error',
    // 确保路径一致
    'import/no-useless-path-segments': 'error',
  },
};
