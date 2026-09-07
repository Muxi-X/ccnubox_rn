const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const { stdin: input, stdout: output } = require('node:process');
const { createInterface } = require('readline/promises');

let fetchFn = global.fetch;
if (!fetchFn) {
  try {
    fetchFn = (...args) => require('node-fetch')(...args);
  } catch (err) {
    console.error('本地 node 版本需18+或自行安装 node-fetch！');
    process.exit(1);
  }
} else {
  fetchFn = fetch;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令退出，退出码: ${code}`));
      }
    });
    child.on('error', error => {
      reject(error);
    });
  });
}

(function loadEnvVariables() {
  try {
    // eslint-disable-next-line global-require
    const dotenvFlow = require('dotenv-flow');
    dotenvFlow.config({
      silent: true,
      override: false,
      purge_dotenv: false,
    });
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.warn('未安装 dotenv-flow，无法自动加载 .env/.env.local');
      console.warn('请运行 `pnpm add -D dotenv-flow` 后重试。');
    } else {
      console.warn('加载 dotenv-flow 失败：', err.message);
    }
  }
})();

(async () => {
  let username = '';
  let password = '';

  const envUsername = process.env.API_USERNAME;
  if (typeof envUsername === 'string') {
    username = envUsername.trim();
  }

  const envPassword = process.env.API_PASSWORD;
  if (typeof envPassword === 'string') {
    password = envPassword.trim();
  }

  let rl;
  try {
    if (!username || !password) {
      rl = createInterface({ input, output });

      if (!username) {
        username = (await rl.question('BasicAuth 用户名：')).trim();
      }

      if (!password) {
        password = (await rl.question('BasicAuth 密码：')).trim();
      }
    }
  } catch (err) {
    console.error('输入过程出错：', err.message);
    if (rl) {
      rl.close();
    }
    process.exit(1);
  }

  if (rl) {
    rl.close();
  }

  const mainBaseUrl = (
    process.env.API_BASE_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    'https://v3.ccnubox.muxixyz.com/api/v1'
  ).replace(/\/+$/, '');
  const mainDocPath = mainBaseUrl.endsWith('/api/v1')
    ? '/swag'
    : '/api/v1/swag';
  const mainDocUrl = process.env.API_DOC_URL || `${mainBaseUrl}${mainDocPath}`;

  const feedbackBaseUrl = (
    process.env.FEEDBACK_BASE_URL ||
    process.env.EXPO_PUBLIC_FEEDBACK_BASE_URL ||
    'https://feedback.muxixyz.com'
  ).replace(/\/+$/, '');
  const feedbackDocPath = feedbackBaseUrl.endsWith('/api/v1')
    ? '/openapi'
    : '/api/v1/openapi';
  const feedbackDocUrl =
    process.env.FEEDBACK_API_DOC_URL || `${feedbackBaseUrl}${feedbackDocPath}`;

  const apis = [
    {
      name: 'CCNUBox 主服务',
      url: mainDocUrl,
      schemaPath: './src/request/openapi.yaml',
      outputPath: './src/request/schema.d.ts',
      cleanContent: text => text,
    },
    {
      name: '反馈服务 (Feedback)',
      url: feedbackDocUrl,
      schemaPath: './src/request/openapi.feedback.yaml',
      outputPath: './src/request/schema.feedback.d.ts',
      cleanContent: text =>
        text.replace(/\{"code":\s*\d+.*\}\s*$/, '').trimEnd() + '\n',
    },
  ];

  for (const api of apis) {
    console.log(`\n正在拉取 [${api.name}] 接口文档: ${api.url}`);
    let apidocText = '';
    try {
      const res = await fetchFn(api.url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        },
      });
      if (!res.ok) {
        console.error(
          `[${api.name}] 接口请求失败`,
          res.status,
          await res.text()
        );
        process.exit(1);
      }
      apidocText = await res.text();
    } catch (err) {
      console.error(`[${api.name}] 请求接口失败：`, err.message);
      process.exit(1);
    }

    try {
      const cleaned = api.cleanContent(apidocText);
      writeFileSync(api.schemaPath, cleaned);
      console.log(`[${api.name}] ${api.schemaPath} 写入完成`);
    } catch (err) {
      console.error(`[${api.name}] 写文件失败：`, err.message);
      process.exit(1);
    }

    try {
      await runCommand('pnpx', [
        'openapi-typescript',
        api.schemaPath,
        '-o',
        api.outputPath,
      ]);
      console.log(`[${api.name}] 类型定义生成完毕：${api.outputPath}`);
    } catch (err) {
      console.error(`[${api.name}] 类型定义生成/命令执行失败：`, err.message);
      process.exit(1);
    }
  }

  // 格式化
  try {
    await runCommand('pnpm', ['format']);
    console.log('\n代码格式化完成！');
  } catch (err) {
    console.error('格式化失败：', err.message);
    process.exit(1);
  }
})();
