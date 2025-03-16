module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type 相关规则
    'type-enum': [
      2,
      'always',
      [
        'init', // 初始化项目
        'feat', // 新功能（feature）
        'fix', // 修补 bug
        'docs', // 文档（documentation）
        'style', // 格式（不影响代码运行的变动）
        'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
        'perf', // 性能优化
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'revert', // 回滚到上一个版本
        'build', // 影响构建系统或外部依赖的更改
        'ci', // 更改 CI 配置文件和脚本
      ],
    ],
    'type-case': [2, 'always', 'lower-case'], // 提交信息的 type 必须小写
    'type-empty': [2, 'never'], // 提交信息的 type 不能为空

    // Scope 相关规则
    'scope-enum': [
      2,
      'always',
      ['global', 'components', 'pages', 'hooks', 'utils', 'styles', 'config'], // 提交信息的 scope 必须在指定的范围内
    ],
    'scope-case': [2, 'always', 'lower-case'], // 提交信息的 scope 必须小写
    'scope-empty': [2, 'never'], // 提交信息的 scope 不能为空

    // Subject 相关规则
    'subject-case': [2, 'never', ['start-case', 'pascal-case']], // 提交信息的 subject 必须符合指定的大小写规范
    'header-max-length': [2, 'always', 72], // 提交信息的 header 最大长度为 72 个字符

    // Body 和 Footer 相关规则
    'body-leading-blank': [1, 'always'], // 提交信息的 body 必须以空行开头
    'body-max-line-length': [1, 'always', 100], // 提交信息的 body 每行最大长度为 100 个字符
    'footer-leading-blank': [1, 'always'], // 提交信息的 footer 必须以空行开头
    'footer-max-line-length': [1, 'always', 20], // 提交信息的 footer 每行最大长度为 20 个字符
  },
};
