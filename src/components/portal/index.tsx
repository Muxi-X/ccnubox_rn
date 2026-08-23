import React, {
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { View } from 'react-native';

import { usePortalStore } from '@/store/portal';

interface ModalPortalProps {
  children?: React.ReactNode;
}

/**
 * 所有要在 portal 中注册的组件的基本类型
 */
export interface PortalBaseProps {
  /* 当前组件的 key */
  currentKey?: number;
  /* 当前组件在 portal 中的 type */
  portalType?: string;
}

const PortalRoot = forwardRef<any, ModalPortalProps>(function PortalRoot(
  { children },
  ref
) {
  const [modalChildren, setModalChildren] = useState<React.ReactNode>(children);

  useImperativeHandle(ref, () => ({
    setChildren: (newChildren: React.ReactNode) => {
      setModalChildren(newChildren);
    },
  }));

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {modalChildren}
    </View>
  );
});

export default PortalRoot;

/**
 * 挂载在 root 下的 Portal
 * @param children 需要被 portal 的组件
 * @constructor
 */
export const Portal: React.FC<{ children: ReactElement }> = ({ children }) => {
  const key = useMemo(() => {
    return usePortalStore.getState().appendChildren(children);
  }, []);
  useEffect(() => {
    usePortalStore.getState().updateChildren(key, children.props);
  }, [children]);
  return <></>;
};
