import FontAwesome from '@expo/vector-icons/FontAwesome';
/** 下方导航栏元素类型 */
export type SingleTabType = {
  /**
   * Tab别名
   */
  name: string;
  /**
   * Tab显示文本
   */
  title?: string;
  /**
   * Tab上icon的名字，但是FontAwesome没提供类型，可能出不来
   */
  iconName?: typeof FontAwesome.name;
};
