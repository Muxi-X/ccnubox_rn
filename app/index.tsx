import { Redirect } from 'expo-router';

// 由于 expo 没有 initialRoutes
// 重定向到 tabs
// 详情见 issue: https://github.com/expo/router/issues/763#issuecomment-1635316964
const Index = () => {
  return <Redirect href={'/(tabs)'}></Redirect>;
};
export default Index;
