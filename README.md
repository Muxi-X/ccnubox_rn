# ccnubox_rn
华师匣子rn版

# 项目简述


# 指令
## build（打包部署production环境）
```bash
  eas build --platform android --profile production
```
## update（热更新）
```bash
 eas update --branch production --message "wdigets test_1"

```
# 更新须知
- 热更新更新通知位于 `assets/data/updateInfo.json`中，每次热更新手动更新其中的版本号以及更新内容