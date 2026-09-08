const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量：先载入 .env，再由 .env.local 覆盖
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envLocalPath = path.join(rootDir, '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

// 检查是否存在 EXPO_TOKEN
if (!process.env.EXPO_TOKEN) {
  // eslint-disable-next-line no-console
  console.error(
    '\n[OTA] 错误: 未检测到 EXPO_TOKEN 环境变量！\n' +
      '请在 .env 或 .env.local 中配置 EXPO_TOKEN 后再试。\n'
  );
  process.exit(1);
}

// 获取发布分支及附加参数
const targetBranch = process.argv[2];
if (!targetBranch) {
  // eslint-disable-next-line no-console
  console.error('请指定发布分支，例如: node ./scripts/ota.js production');
  process.exit(1);
}

const extraArgs = process.argv.slice(3);
const args = ['publish', '--branch', targetBranch, ...extraArgs];

// eslint-disable-next-line no-console
console.log(`[OTA] 正在发布热更新至分支: ${targetBranch}`);

const child = spawn('eoas', args, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
  cwd: rootDir,
});

child.on('close', code => {
  process.exit(code ?? 0);
});

child.on('error', err => {
  // eslint-disable-next-line no-console
  console.error('[OTA] 执行指令失败:', err.message);
  process.exit(1);
});
