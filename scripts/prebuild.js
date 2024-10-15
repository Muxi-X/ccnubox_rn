const { spawn } = require('child_process');

const { select } = require('@inquirer/prompts');

async function prebuild() {
  const platform = await select({
    message: '选择 build 平台',
    choices: [
      {
        name: 'android',
        value: 'android',
        description: '🤖',
      },
      {
        name: 'ios',
        value: 'ios',
        description: '🍎',
      },
    ],
  });
  const profile = await select({
    message: '选择发布环境',
    choices: [
      {
        name: '测试',
        value: 'test',
        description: 'test',
      },
      {
        name: '开发',
        value: 'development',
        description: 'development',
      },
      {
        name: '正式',
        value: 'production',
        description: 'production',
      },
    ],
  });
  /* 以 promise 的方式执行命令 */
  function runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: 'inherit', // 保留输出颜色
      });

      process.on('close', code => {
        if (code === 0) {
          resolve(); // 成功执行，resolve promise
        } else {
          reject(new Error(`命令退出，退出码: ${code}`)); // 失败，reject promise
        }
      });

      process.on('error', error => {
        reject(error); // 执行失败，reject promise
      });
    });
  }
  async function executeBuild(platform, profile) {
    try {
      console.log('\r镜像源配置完成.');
      // 然后执行 prebuild 和 build
      console.log('开始构建...');
      await runCommand('sh', ['-c', `pnpx expo prebuild --no-install --clean`]);
      console.log('\r构建完成');
      await runCommand('sh', [
        '-c',
        `eas build --platform ${platform} --profile ${profile}`,
      ]);
    } catch (error) {
      console.error(`执行出错: ${error.message}`);
    }
  }
  void executeBuild(platform, profile);
}

void prebuild();
