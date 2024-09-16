module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能（feature）
        'fix', // 修补bug
        'docs', // 文档（documentation）
        'style', // 格式（不影响代码运行的变动）
        'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
        'perf', // 性能优化
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'revert', // 回滚到上一个版本
        'build', // 影响构建系统或外部依赖的更改
        'ci', // 更改CI配置文件和脚本
      ],
    ],
    'subject-case': [2, 'never', ['start-case', 'pascal-case']], // 提交信息主题部分不能使用大写开头或Pascal Case
    'header-max-length': [2, 'always', 72], // 提交信息的最大长度
  },
};
