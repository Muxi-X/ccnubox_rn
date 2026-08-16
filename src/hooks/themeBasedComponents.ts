import useVisualScheme from '@/store/visualScheme';
import { componentMap } from '@/themeBasedComponents';
import { ConfigurableComponentName } from '@/themeBasedComponents/type';

/**
 * 响应式获取当前布局对应的组件映射
 */
export const useThemeBasedComponents = () => {
  const layoutName = useVisualScheme(state => state.layoutName);
  return componentMap[layoutName];
};

/**
 * 响应式获取指定的可配置主题组件
 */
export const useThemeBasedComponent = (name: ConfigurableComponentName) => {
  const layoutName = useVisualScheme(state => state.layoutName);
  return componentMap[layoutName][name];
};

export default useThemeBasedComponents;
